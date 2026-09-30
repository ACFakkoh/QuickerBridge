"""JSON boundary shared by the browser worker and native regression tests."""

import base64
import json

from .models import Model
from .engine import analyse, influence, position_record, snapshot, traverse
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
    elif action in ("analyse", "compare"):
        value = analyse(Model.model_validate(data["model"]))
        if action == "analyse":
            _results[data["job"]] = value
            for key in list(_results)[:-3]:
                del _results[key]
    elif action == "modal":
        from .modal import analyse_modal

        value = analyse_modal(Model.model_validate(data["model"]))
    elif action in ("influence", "traverse"):
        result = _results[data["job"]]
        if result.get("kind") == "thermal":
            raise ValueError("thermal.snapshot")
        model = Model.model_validate(result["model"])
        if action == "influence":
            index = int(data.get("index", 0))
            nx = len(result["x"])
            support = data.get("support")
            value = influence(
                model,
                index,
                None if support is None else int(support),
                result["case_max"][nx + index] if 0 <= index < nx else None,
                result["case_min"][nx + index] if 0 <= index < nx else None,
            )
        else:
            direction = data.get("direction", "forward")
            if direction not in ("forward", "reverse"):
                raise ValueError("vehicle.direction")
            value = traverse(model, direction, int(data.get("frames", 60)))
    elif action in ("snapshot", "excel"):
        result = _results[data["job"]]
        if action == "excel":
            # Imported lazily: openpyxl is optional in the browser (a blocked
            # PyPI download must not prevent the analysis from starting).
            from .exports import excel_bytes

            language = data.get("lang", "fr")
            if language not in ("en", "fr"):
                raise ValueError("language")
            export_model = Model.model_validate(result["model"])
            if "modal" in data:
                from .models import ModalSettings

                export_model.modal = ModalSettings.model_validate(data["modal"])
            value = base64.b64encode(
                excel_bytes(result, language, export_model)
            ).decode("ascii")
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
                record = position_record(model, position, direction)
            value = snapshot(model, record, index, sense)
    else:
        raise ValueError("unknown.action")
    return json.dumps(value, allow_nan=False)
