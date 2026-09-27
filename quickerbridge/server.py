"""Loopback-only API and bundled static viewer."""

from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import threading
import uuid

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse, Response, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from .models import Model
from .engine import analyse, position_record, snapshot
from .exports import csv_bytes, excel_bytes
from .version import APP_VERSION


ROOT = Path(__file__).resolve().parents[1]
app = FastAPI(title="QuickerBridge", docs_url=None, redoc_url=None)
worker = ThreadPoolExecutor(max_workers=1, thread_name_prefix="quickerbridge")
jobs = {}
state_lock = threading.Lock()
latest = None


@app.middleware("http")
async def local_only(request: Request, call_next):
    origin = request.headers.get("origin")
    host = request.headers.get("host", "").split(":")[0]
    if host not in ("127.0.0.1", "localhost", "testserver"):
        return JSONResponse({"detail": "local_only"}, status_code=403)
    if origin and origin not in ("http://127.0.0.1:8765", "http://localhost:8765"):
        return JSONResponse({"detail": "local_only"}, status_code=403)
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Cache-Control"] = "no-store"
    return response


@app.get("/")
def index():
    return FileResponse(ROOT / "dist" / "index.html")


@app.get("/api/health")
def health():
    return {"app": "QuickerBridge", "version": APP_VERSION}


@app.get("/api/defaults")
def defaults():
    return Model().model_dump()


def run_job(key, model):
    with state_lock:
        if key != latest:
            jobs[key] = {"status": "superseded"}
            return
        jobs[key] = {"status": "running"}
    try:
        result = analyse(model)
        with state_lock:
            jobs[key] = {"status": "complete", "result": result}
            # Retain the current result and a few preceding results for exports.
            for old in list(jobs)[:-5]:
                jobs.pop(old, None)
    except Exception as exc:
        import traceback

        traceback.print_exc()
        with state_lock:
            jobs[key] = {"status": "error", "message": str(exc)}


@app.post("/api/jobs")
def create_job(model: Model):
    global latest
    key = uuid.uuid4().hex
    with state_lock:
        latest = key
        jobs[key] = {"status": "queued"}
    worker.submit(run_job, key, model)
    return {"id": key}


def get_job(key):
    with state_lock:
        result = jobs.get(key)
    if result is None:
        raise HTTPException(404, "result.expired")
    return result


@app.get("/api/jobs/{key}")
def job_status(key: str):
    return get_job(key)


class SnapshotRequest(BaseModel):
    job: str
    index: int = Field(default=0, ge=0)
    sense: str = "max"
    position: float | None = None
    direction: str = "forward"


@app.post("/api/snapshot")
def get_snapshot(body: SnapshotRequest):
    job = get_job(body.job)
    if job["status"] != "complete":
        raise HTTPException(409, "result.pending")
    result = job["result"]
    if result.get("kind") == "thermal":
        raise HTTPException(422, "thermal.snapshot")
    model = Model.model_validate(result["model"])
    if body.sense not in ("min", "max") or body.index >= len(result["case_max"]):
        raise HTTPException(422, "result.index")
    record = result["case_" + body.sense][body.index]
    if body.position is not None:
        if body.direction not in ("forward", "reverse") or abs(body.position) > 1200:
            raise HTTPException(422, "vehicle.position")
        record = position_record(model, body.position, body.direction)
    return worker.submit(snapshot, model, record, body.index, body.sense).result()


@app.get("/api/export/{key}/{kind}")
def export(key: str, kind: str, lang: str = "en"):
    job = get_job(key)
    if job["status"] != "complete" or lang not in ("en", "fr"):
        raise HTTPException(422, "result.pending")
    if kind == "csv":
        content, media = csv_bytes(job["result"], lang), "text/csv; charset=utf-8"
    elif kind == "xlsx":
        content, media = (
            excel_bytes(job["result"], lang),
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
    else:
        raise HTTPException(404)
    return Response(
        content,
        media_type=media,
        headers={
            "Content-Disposition": f'attachment; filename="QuickerBridge-{lang}.{kind}"'
        },
    )


app.mount("/assets", StaticFiles(directory=ROOT / "dist"), name="assets")

# Optional developer server only; the delivered page uses the browser worker.
app.mount("/", StaticFiles(directory=ROOT / "dist", html=True), name="viewer")
