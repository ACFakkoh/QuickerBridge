"""Validated, unit-explicit inputs shared by analysis and exports."""

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator


class InputModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class Section(InputModel):
    name: str = Field(default="S1", max_length=60)
    kind: Literal["girder", "ei"] = "girder"
    EI: float = Field(default=20_000_000, gt=0, le=1e15)  # kN m², direct stiffness
    E: float = Field(default=200, gt=0, le=1000)  # GPa
    inertia_modifier: float = Field(default=1, gt=0, le=1000)
    depth: float = Field(default=1200, gt=0, le=15000)  # mm, overall depth
    top_width: float = Field(default=350, gt=0, le=20000)
    top_thickness: float = Field(default=25, gt=0, le=2000)
    web_thickness: float = Field(default=14, gt=0, le=2000)
    bottom_width: float = Field(default=600, gt=0, le=20000)
    bottom_thickness: float = Field(default=50, gt=0, le=2000)

    @model_validator(mode="after")
    def geometry(self):
        if self.kind == "ei":
            return self
        if self.depth <= self.top_thickness + self.bottom_thickness:
            raise ValueError("geometry.depth")
        if self.web_thickness > min(self.top_width, self.bottom_width):
            raise ValueError("geometry.web")
        return self


class Zone(InputModel):
    end: float = Field(gt=0, le=1)  # fraction of span; starts at previous end
    section: int = Field(ge=0)
    end_section: int | None = Field(default=None, ge=0)
    profile: Literal["constant", "linear", "parabolic"] = "constant"
    # Which section supplies plates, E and inertia modifier in a taper. Only
    # the overall depth is interpolated. "start" is the v0.4 behaviour; "end"
    # and "deep" make a haunch invariant when start/end sections are swapped.
    plates: Literal["start", "end", "deep"] = "start"


def plate_source(zone, a, b):
    """Section providing plates/E/modifier for a zone between sections a, b."""
    if zone.plates == "end":
        return b
    if zone.plates == "deep" and b.depth > a.depth:
        return b
    return a


class Span(InputModel):
    length: float = Field(default=34.8, ge=0.5, le=200)
    section: int = Field(default=0, ge=0)
    zones: list[Zone] = Field(default_factory=list, max_length=12)


class DeadLoad(InputModel):
    name: str = Field(default="Permanent load", max_length=80)
    w: float = Field(default=10, ge=0, le=10000)
    factor: float = Field(default=1, ge=0, le=1000)
    span: int = Field(default=-1, ge=-1)  # -1 = all spans
    start: float = Field(default=0, ge=0, lt=1)
    end: float = Field(default=1, gt=0, le=1)

    @model_validator(mode="after")
    def extent(self):
        if self.end <= self.start:
            raise ValueError("load.extent")
        return self


class LiveLoad(InputModel):
    vehicle: Literal[
        "CL625",
        "CL750QC",
        "HL93Truck",
        "HL93Tandem",
        "Cooper",
        "Maintenance",
        "custom",
    ] = "CL750QC"
    weights: list[float] = Field(
        default_factory=lambda: [50, 125, 125, 175, 150], min_length=1, max_length=7
    )
    spacings: list[float] = Field(
        default_factory=lambda: [3.6, 1.2, 6.6, 6.6], max_length=6
    )
    case: Literal["governing", "truck", "lane"] = "governing"
    lane_fraction: Literal[0.63, 0.8] = 0.8
    lane_w: float = Field(default=9, ge=0, le=1000)  # custom vehicle only
    cooper_e: float = Field(default=80, ge=10, le=200)  # AREA / AREMA Cooper E
    factor: float = Field(default=1, ge=0, le=1000)
    axle_factor: float = Field(default=1, ge=0, le=1000)
    dynamic: bool = True
    direction: Literal["both", "forward", "reverse"] = "both"

    @model_validator(mode="after")
    def axles(self):
        if len(self.spacings) != len(self.weights) - 1:
            raise ValueError("vehicle.spacing_count")
        if any(not 0 < w <= 10000 for w in self.weights):
            raise ValueError("vehicle.weights")
        if any(not 0 < s <= 50 for s in self.spacings):
            raise ValueError("vehicle.spacings")
        return self


class ThermalLoad(InputModel):
    delta_T: float = Field(default=15, ge=-100, le=100)  # T_top - T_bottom, deg C
    alpha_micro: float = Field(default=12, gt=0, le=100)  # 10^-6 / deg C
    depth: float = Field(default=1200, gt=0, le=15000)  # thermal reference depth, mm


class Model(InputModel):
    spans: list[Span] = Field(
        default_factory=lambda: [Span(), Span()], min_length=1, max_length=5
    )
    supports: list[Literal["pin", "roller", "fixed"]] = Field(
        default_factory=lambda: ["roller", "pin", "roller"]
    )
    sections: list[Section] = Field(
        default_factory=lambda: [Section()], min_length=1, max_length=20
    )
    nonprismatic: bool = False
    dead: list[DeadLoad] = Field(default_factory=lambda: [DeadLoad()], max_length=30)
    live: LiveLoad = Field(default_factory=LiveLoad)
    thermal: ThermalLoad = Field(default_factory=ThermalLoad)
    load_mode: Literal["dead", "live", "both", "thermal"] = "both"
    subdivisions: int = Field(default=10, ge=2, le=100)
    precision: Literal["standard", "fine"] = "standard"

    @model_validator(mode="after")
    def consistency(self):
        if len(self.supports) != len(self.spans) + 1:
            raise ValueError("model.supports")
        for span in self.spans:
            if span.section >= len(self.sections):
                raise ValueError("model.section")
            previous = 0
            for zone in span.zones:
                if zone.end <= previous or zone.section >= len(self.sections):
                    raise ValueError("model.zones")
                if zone.end_section is not None and zone.end_section >= len(
                    self.sections
                ):
                    raise ValueError("model.section")
                if zone.profile != "constant" and any(
                    self.sections[i].kind == "ei"
                    for i in (
                        zone.section,
                        zone.end_section
                        if zone.end_section is not None
                        else zone.section,
                    )
                ):
                    raise ValueError("model.constant_ei_zone")
                if zone.profile != "constant":
                    a = self.sections[zone.section]
                    b = self.sections[
                        zone.end_section
                        if zone.end_section is not None
                        else zone.section
                    ]
                    p = plate_source(zone, a, b)
                    if min(a.depth, b.depth) <= p.top_thickness + p.bottom_thickness:
                        raise ValueError("geometry.depth")
                previous = zone.end
            if self.nonprismatic and span.zones and abs(previous - 1) > 1e-9:
                raise ValueError("model.coverage")
        if any(load.span >= len(self.spans) for load in self.dead):
            raise ValueError("load.span")
        return self
