"""JSON boundary shared by the browser worker and native regression tests."""

import base64
import json

from .models import Model, default_model
from .engine import analyse, influence, position_record, snapshot, traverse
from .projects import validate_project

_results = {}


def dispatch(raw: str) -> str:
    request = json.loads(raw)
    action = request["action"]
    data = request.get("data", {})
    if action == "defaults":
        value = default_model().model_dump()
    elif action == "validate_project":
        value = validate_project(data["text"])
    elif action in ("analyse", "compare"):
        value = analyse(Model.model_validate(data["model"]))
        if action == "analyse":
            _results[data["job"]] = value
            for key in list(_results)[:-3]:
                del _results[key]
    elif action == "stress":
        from .engine import stress_all, stress_at

        result = _results[data["job"]]
        if result.get("kind") == "thermal":
            raise ValueError("thermal.stress")
        index = int(data.get("index", 0))
        stages = (data.get("self_weight_stage", "steel"), data.get("dead_stage", "3n"))
        if not 0 <= index < len(result["x"]) or any(
            s not in ("steel", "3n") for s in stages
        ):
            raise ValueError("stress.request")
        model = Model.model_validate(result["model"])
        # Slab data are display-only and never trigger an analysis: use the
        # current ones sent by the page (one entry per section, or None).
        composites = data.get("composites")
        if composites is not None:
            from .models import CompositeSlab

            for section, slab in zip(model.sections, composites):
                section.composite = (
                    None if slab is None else CompositeSlab.model_validate(slab)
                )
        value = (
            stress_all(model, result, *stages)
            if data.get("all")
            else stress_at(model, result, index, *stages)
        )
    elif action == "section_properties":
        # Loaded only when the user opens the section properties window.
        from .models import Section
        from .section_props import section_properties

        value = section_properties(Section.model_validate(data["section"]))
    elif action == "axle_factor":
        from .distribution import truck_fraction

        value = truck_fraction(Model.model_validate(data["model"]))
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
            if "distribution" in data:
                # FT settings do not change the analysis: export the current ones.
                from .models import Distribution

                export_model.distribution = Distribution.model_validate(
                    data["distribution"]
                )
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
