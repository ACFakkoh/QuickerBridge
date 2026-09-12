"""JSON boundary shared by the browser worker and native regression tests."""

import base64
import json

from .models import Model
from .engine import analyse, snapshot
from .loads import vehicle_data, dynamic_factor
from .exports import excel_bytes
from .projects import validate_project

_results = {}


def dispatch(raw: str) -> str:
    request = json.loads(raw)
    action = request["action"]
    data = request.get("data", {})
    if action == "defaults":
        value = Model().model_dump()
    elif action == "validate_project":
        value = validate_project(data["text"])
    elif action == "analyse":
        value = analyse(Model.model_validate(data["model"]))
        _results[data["job"]] = value
        for key in list(_results)[:-3]:
            del _results[key]
    elif action in ("snapshot", "excel"):
        result = _results[data["job"]]
        if action == "excel":
            language = data.get("lang", "fr")
            if language not in ("en", "fr"):
                raise ValueError("language")
            value = base64.b64encode(excel_bytes(result, language)).decode("ascii")
        else:
            if result.get("kind") == "thermal":
                raise ValueError("thermal.snapshot")
            model = Model.model_validate(result["model"])
            index, sense = data.get("index", 0), data.get("sense", "max")
            if sense not in ("min", "max") or not 0 <= index < len(result["case_max"]):
                raise ValueError("result.index")
            record = result["case_" + sense][index]
            if data.get("position") is not None:
                position, direction = data["position"], data.get("direction", "forward")
                if not -1200 <= position <= 1200 or direction not in (
                    "forward",
                    "reverse",
                ):
                    raise ValueError("vehicle.position")
                weights, _ = vehicle_data(model.live)
                ids = list(range(1, len(weights) + 1))
                record = dict(
                    case="truck",
                    direction=direction,
                    position=position,
                    axles=ids,
                    factor=dynamic_factor(
                        ids,
                        model.live.dynamic,
                        model.live.vehicle in {"CL625", "CL750QC"},
                        model.live.vehicle,
                    ),
                )
            value = snapshot(model, record, index, sense)
    else:
        raise ValueError("unknown.action")
    return json.dumps(value, allow_nan=False)
