"""Versioned QuickerBridge project-file serialization and validation."""

from datetime import datetime, timezone
import json

from pydantic import BaseModel, ConfigDict, Field

from .models import Model
from .version import APP_VERSION


FORMAT = "QuickerBridgeProject"
SCHEMA_VERSION = 16
MAX_PROJECT_BYTES = 1024 * 1024


class ProjectFile(BaseModel):
    model_config = ConfigDict(extra="forbid")

    format: str
    schema_version: int
    app_version: str
    name: str = Field(min_length=1, max_length=120)
    saved_at: datetime
    model: Model


def create_project(model: Model, name: str, saved_at: datetime | None = None) -> dict:
    saved_at = saved_at or datetime.now(timezone.utc)
    project = ProjectFile(
        format=FORMAT,
        schema_version=SCHEMA_VERSION,
        app_version=APP_VERSION,
        name=name.strip() or "QuickerBridge project",
        saved_at=saved_at,
        model=model,
    )
    return project.model_dump(mode="json")


def validate_project(text: str) -> dict:
    if len(text.encode("utf-8")) > MAX_PROJECT_BYTES:
        raise ValueError("project.too_large")
    try:
        raw = json.loads(text)
    except (json.JSONDecodeError, TypeError) as error:
        raise ValueError("project.invalid_json") from error
    if not isinstance(raw, dict) or raw.get("format") != FORMAT:
        raise ValueError("project.format")
    version = raw.get("schema_version")
    if not isinstance(version, int) or version > SCHEMA_VERSION:
        raise ValueError("project.version")
    if version <= 6 and isinstance(raw.get("model"), dict):
        # v0.9 offered one enveloped FT ("effect"); zones replace it in v0.9.1.
        distribution = raw["model"].get("distribution")
        if isinstance(distribution, dict):
            distribution.pop("effect", None)
    if version < 10 and isinstance(raw.get("model"), dict):
        model = raw["model"]
        # v0.9.6 (schema 9) stored the stress stages globally; they are now
        # one choice per permanent load, the self-weight on the girder alone.
        stress = model.pop("stress", None)
        if isinstance(stress, dict) and stress.get("dead") == "steel":
            for load in model.get("dead") or []:
                if isinstance(load, dict):
                    load.setdefault("stage", "steel")
        # The thermal reference depth now comes from the sections; older
        # projects keep the depth they were saved with.
        if isinstance(model.get("thermal"), dict):
            model["thermal"].setdefault("depth_source", "manual")
    if version < 14 and isinstance(raw.get("model"), dict):
        model = raw["model"]
        # v0.9.97: the pedestrian load uses the S6-25 expression only (the
        # editable a, b, p min, p max of v0.9.96 are gone) and the lane UDL
        # is always placed on the spans that increase each effect.
        pedestrian = model.get("pedestrian")
        if isinstance(pedestrian, dict):
            for key in ("a", "b", "p_min", "p_max"):
                pedestrian.pop(key, None)
        if isinstance(model.get("live"), dict):
            model["live"]["lane_extent"] = "spans"
    if isinstance(raw.get("model"), dict):
        # v0.9.5 briefly had a constant support section (support_length); it
        # overrode the non-prismatic zones and was removed in v0.9.6.
        raw["model"].pop("support_length", None)
    if version < 5 and isinstance(raw.get("model"), dict):
        # Before v0.8.6 the girder self-weight was never added automatically;
        # older projects keep the results they were saved with.
        raw["model"].setdefault("self_weight", {"apply": False})
    if version == 1:
        # Earlier tapered projects interpolated every plate dimension and E.
        # Upgrade only when depth-only interpolation preserves that model.
        model = Model.model_validate(raw.get("model"))
        if model.nonprismatic:
            for span in model.spans:
                for zone in span.zones:
                    if zone.profile == "constant":
                        continue
                    a = model.sections[zone.section]
                    b = model.sections[
                        zone.end_section
                        if zone.end_section is not None
                        else zone.section
                    ]
                    if any(
                        getattr(a, key) != getattr(b, key)
                        for key in (
                            "E",
                            "top_width",
                            "top_thickness",
                            "web_thickness",
                            "bottom_width",
                            "bottom_thickness",
                            "inertia_modifier",
                        )
                    ):
                        raise ValueError("project.legacy_taper")
        raw["schema_version"] = SCHEMA_VERSION
    elif version in (2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15):
        # v0.4 files: zones without ``plates`` keep the start-section
        # convention, which is the default. Pin/roller supports are unchanged.
        raw["schema_version"] = SCHEMA_VERSION
        # v0.5-v0.7 files have no ``modal`` block: the defaults apply.
        # Schema 4 files have no isostatic spans (``simple`` defaults false).
        # Schema 12 and older: the lane UDL takes the new default extent
        # (loaded spans, v0.9.96) and the live load stays the vehicle.
        # Schema 13 and older: no evaluation level (design loads) and no
        # resistance block (defaults).
        # Schema 14 (v0.9.97): the resistance inputs Mf, Vf, φ and bar fy are
        # dropped (efforts from the analysis), road classes C and D become
        # "CD", and a CL-750-QC evaluation level returns to design loads
        # (models.Resistance / models.LiveLoad validators).
        # Schema 15 (v0.9.98): no deck joint (disabled default); a section
        # without composite inertia and M = 1 becomes "girder alone", a
        # multiplier M != 1 stays as entered ("manual", legacy); the
        # resistance compares permanent + live effects (models.Section).
    elif version != SCHEMA_VERSION:
        raise ValueError("project.version")
    return ProjectFile.model_validate(raw).model_dump(mode="json")
