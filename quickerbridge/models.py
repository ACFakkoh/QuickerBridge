"""Validated, unit-explicit inputs shared by analysis and exports."""

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator


class InputModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


BAR_DIAMETERS = {"10M": 11.3, "15M": 16.0, "20M": 19.5}  # mm


class CompositeSlab(BaseModel):
    """Concrete deck acting with a steel girder, for section properties only.

    Display only (v0.9.3bis): it never changes the beam stiffness; the user may
    copy a composite / steel inertia ratio into the inertia modifier M.
    Lengths in mm, f'c and Fy in MPa, concrete unit weight in kN/m³.
    """

    model_config = ConfigDict(extra="forbid")

    enabled: bool = True
    slab_thickness: float = Field(default=200, gt=0, le=2000)  # tc
    haunch: float = Field(default=50, ge=0, le=1000)  # concrete haunch
    effective_width: float = Field(default=3110, gt=0, le=20000)  # be
    fc: float = Field(default=35, gt=0, le=150)  # f'c
    unit_weight: float = Field(default=24.0, gt=10, le=40)  # γc, kN/m³
    bar_top: Literal["10M", "15M", "20M"] = "15M"
    spacing_top: float = Field(default=300, gt=10, le=2000)
    bar_bottom: Literal["10M", "15M", "20M"] = "15M"
    spacing_bottom: float = Field(default=300, gt=10, le=2000)
    cover_top: float = Field(default=60, ge=0, le=500)
    cover_bottom: float = Field(default=35, ge=0, le=500)
    fy: float = Field(default=345, gt=0, le=1000)  # girder steel Fy
    frqr: float = Field(default=0.85, gt=0, le=1)  # effective properties
    # S3: distance below the elastic neutral axis (positive downward), mm.
    y3: float = Field(default=500, gt=0, le=15000)
    # v0.9.5: y of S3 per configuration, each below its own ENA; None = y3.
    y_steel: float | None = Field(default=None, gt=0, le=15000)
    y_3n: float | None = Field(default=None, gt=0, le=15000)
    y_1n: float | None = Field(default=None, gt=0, le=15000)
    y_neg: float | None = Field(default=None, gt=0, le=15000)  # I' (M−)
    # Region shown in the section properties window: positive moment (steel,
    # 3n, 1n) or negative moment (steel and I' = steel + bars in tension).
    region: Literal["positive", "negative"] = "positive"

    @model_validator(mode="after")
    def bars_in_slab(self):
        # v0.9.6: both layers inside the concrete, top above bottom, no
        # overlap; the field limits alone do not check their compatibility.
        dt, db = BAR_DIAMETERS[self.bar_top], BAR_DIAMETERS[self.bar_bottom]
        top = self.slab_thickness - self.cover_top - dt / 2
        bottom = self.cover_bottom + db / 2
        if (
            self.cover_top + dt > self.slab_thickness
            or self.cover_bottom + db > self.slab_thickness
            or top - dt / 2 < bottom + db / 2
            or min(self.spacing_top, self.spacing_bottom) < max(dt, db)
        ):
            raise ValueError("composite.bars")
        return self

    def y_of(self, config: str) -> float:
        value = getattr(self, f"y_{config}")
        return self.y3 if value is None else value


NEBT_TYPES = ("NEBT1000", "NEBT1200", "NEBT1400", "NEBT1600", "NEBT1800")
NEBT_DEFAULT_E = 28.0  # GPa, prestressed concrete; editable per section


class Section(InputModel):
    name: str = Field(default="S1", max_length=60)
    # girder: steel I from plates; ei: direct stiffness; nebt: standard
    # precast prestressed NEBT girder with tabulated properties.
    kind: Literal["girder", "ei", "nebt"] = "girder"
    nebt: Literal[NEBT_TYPES] = "NEBT1400"
    EI: float = Field(default=20_000_000, gt=0, le=1e15)  # kN m², direct stiffness
    E: float = Field(default=200, gt=0, le=1000)  # GPa
    inertia_modifier: float = Field(default=1, gt=0, le=1000)
    depth: float = Field(default=1200, gt=0, le=15000)  # mm, overall depth
    top_width: float = Field(default=350, gt=0, le=20000)
    top_thickness: float = Field(default=25, gt=0, le=2000)
    web_thickness: float = Field(default=14, gt=0, le=2000)
    bottom_width: float = Field(default=600, gt=0, le=20000)
    bottom_thickness: float = Field(default=50, gt=0, le=2000)
    composite: CompositeSlab | None = None  # section properties module only

    @model_validator(mode="before")
    @classmethod
    def concrete_modulus(cls, data):
        # A NEBT section given without E is concrete, not the steel default.
        if isinstance(data, dict) and data.get("kind") == "nebt" and "E" not in data:
            data = {**data, "E": NEBT_DEFAULT_E}
        return data

    @model_validator(mode="after")
    def geometry(self):
        if self.kind in ("ei", "nebt"):
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
    # Simply supported (isostatic) span: moment releases at both ends, so no
    # continuity with the neighbouring spans.
    simple: bool = False


class SelfWeight(InputModel):
    """Girder self-weight added to the permanent loads (steel and NEBT only).

    ``*_increase`` are percentage allowances on the nominal girder weight
    (stiffeners, diaphragms, connections...); ``factor`` is a load factor like
    the one of the other permanent loads.
    """

    apply: bool = True
    steel_increase: float = Field(default=15, ge=0, le=200)  # %
    nebt_increase: float = Field(default=10, ge=0, le=200)  # %
    factor: float = Field(default=1, ge=0, le=1000)


class DeadLoad(InputModel):
    name: str = Field(default="Permanent load", max_length=80)
    w: float = Field(default=10, ge=0, le=10000)
    factor: float = Field(default=1, ge=0, le=1000)
    span: int = Field(default=-1, ge=-1)  # -1 = all spans
    start: float = Field(default=0, ge=0, lt=1)
    end: float = Field(default=1, gt=0, le=1)
    # Stress diagrams (v0.9.6): section carrying this load. "steel": girder
    # alone (e.g. slab weight, unshored construction); "3n": long-term
    # composite (superimposed dead loads). The girder self-weight is always
    # carried by the girder alone.
    stage: Literal["steel", "3n"] = "3n"

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
    # CL-750-QC only: MTQ Info-structures A2023-05 chooses 63 % or 80 % of the
    # axles per response; when on, lane_fraction is ignored.
    mtq_auto: bool = True
    lane_w: float = Field(default=9, ge=0, le=1000)  # custom vehicle only
    cooper_e: float = Field(default=80, ge=10, le=200)  # AREA / AREMA Cooper E
    factor: float = Field(default=1, ge=0, le=1000)
    axle_factor: float = Field(default=1, ge=0, le=1000)
    dynamic: bool = True
    two_trucks: bool = False  # HL-93 supplementary 90% negative-moment/pier case
    # v0.9.7: the vehicle always travels in both directions. Older projects
    # may still hold "forward"/"reverse"; they are read as "both".
    direction: Literal["both", "forward", "reverse"] = "both"

    @model_validator(mode="after")
    def both_directions(self):
        self.direction = "both"
        return self

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
    """Imposed deformations (v0.9.7), each analysed on its own.

    ``imposed`` selects the case: thermal gradient, slab shrinkage or slab
    creep. Shrinkage and creep are a uniform shortening of the slab concrete,
    restrained by the girder on the long-term composite section (k·n).
    """

    imposed: Literal["thermal", "shrinkage", "creep"] = "thermal"
    shrinkage_micro: float = Field(default=250, ge=0, le=3000)  # slab shortening, 10^-6
    creep_phi: float = Field(default=2.0, ge=0, le=10)  # creep coefficient
    creep_stress: float = Field(
        default=3.0, ge=0, le=60
    )  # sustained slab compression, MPa
    modular_factor: float = Field(default=3.0, ge=1, le=10)  # k of the k·n section
    delta_T: float = Field(default=15, ge=-100, le=100)  # T_top - T_bottom, deg C
    alpha_micro: float = Field(default=12, gt=0, le=100)  # 10^-6 / deg C
    # v0.9.6: the reference depth comes from the sections (girder + haunch +
    # slab when a slab is defined); "manual" keeps the depth below (direct-EI
    # sections, projects saved before v0.9.6).
    depth_source: Literal["sections", "manual"] = "sections"
    depth: float = Field(default=1200, gt=0, le=15000)  # manual reference depth, mm
    # Linear through the depth, or bilinear (S6-25 type, composite deck):
    # slab_delta_T from the top of the slab to its bottom, constant below.
    profile: Literal["linear", "bilinear"] = "linear"
    slab_delta_T: float = Field(default=35, ge=-100, le=100)


class Distribution(InputModel):
    """S6-25 truck load fraction FT, slab-on-girder bridge (classes A and B).

    With ``apply``, the live-load effects (trucks and lane load, ML and VL) are
    multiplied station by station by the moment fraction (M and δ) and the
    shear fraction (V) of their zone (M+ span zones and M− support zones of
    Figure 5.1), for the selected girder and limit state. Reactions keep one
    full lane. For an exterior girder the dead-load shear takes Fs.
    """

    enabled: bool = False
    apply: bool = False
    # Slab and voided-slab bridges (5.6.4.2, 5.6.5): effects per metre of width.
    bridge_type: Literal["slab_on_girder", "slab", "voided_slab"] = "slab_on_girder"
    slab_width: float = Field(default=12.0, gt=1, le=60)  # B, m (slab bridges)
    # Be, m: equivalent width of a slab with tapered free edges (5.5.2); B if None.
    equivalent_width: float | None = Field(default=None, gt=1, le=60)
    girders: int = Field(default=5, ge=1, le=40)  # N
    spacing: float = Field(default=3.11, gt=0.3, le=10)  # S, m
    overhang: float = Field(default=1.555, ge=0, le=6)  # Sc, m
    carriageway: float = Field(default=10.4, gt=1, le=60)  # Wc, m
    road_class: Literal["AB", "CD"] = "AB"  # Table 5.3 / Table A5.3.3
    skew: float = Field(default=8.5, ge=0, le=45)  # ψ, degrees
    h_left: float = Field(default=3.0, ge=0, le=30)  # integral abutment height, m
    h_right: float = Field(default=3.0, ge=0, le=30)
    girder: Literal["interior", "exterior"] = "interior"
    state: Literal["ULS", "FLS"] = "ULS"
    # Skew factor Fs on the permanent-load shear and reactions of the
    # exterior girder / exterior slab portion (5.6.6.2), when FT is applied.
    fs_dead: bool = True


class ModalSettings(InputModel):
    """Free-vibration settings. The mass is not a load: it only feeds the
    eigenvalue analysis and never changes the static results."""

    mass_source: Literal["dead", "custom"] = "dead"
    mass: float = Field(default=10.0, gt=0, le=10000)  # kN/m (weight), custom source
    modes: int = Field(default=6, ge=1, le=12)


class Model(InputModel):
    spans: list[Span] = Field(
        default_factory=lambda: [Span(), Span()], min_length=1, max_length=7
    )
    supports: list[Literal["pin", "roller", "fixed", "spring"]] = Field(
        default_factory=lambda: ["roller", "pin", "roller"]
    )
    # Rotational spring stiffness per support, kN·m/rad (used by "spring").
    support_springs: list[float] = Field(default_factory=list, max_length=8)
    sections: list[Section] = Field(
        default_factory=lambda: [Section()], min_length=1, max_length=20
    )
    nonprismatic: bool = False
    dead: list[DeadLoad] = Field(default_factory=lambda: [DeadLoad()], max_length=30)
    self_weight: SelfWeight = Field(default_factory=SelfWeight)
    live: LiveLoad = Field(default_factory=LiveLoad)
    thermal: ThermalLoad = Field(default_factory=ThermalLoad)
    modal: ModalSettings = Field(default_factory=ModalSettings)
    distribution: Distribution = Field(default_factory=Distribution)
    load_mode: Literal["dead", "live", "both", "thermal"] = "both"
    subdivisions: int = Field(default=10, ge=2, le=100)
    precision: Literal["standard", "fine"] = "standard"

    @model_validator(mode="after")
    def consistency(self):
        if len(self.supports) != len(self.spans) + 1:
            raise ValueError("model.supports")
        if self.nonprismatic and any(s.kind == "nebt" for s in self.sections):
            # v0.9.6: precast NEBT girders have a constant tabulated section.
            raise ValueError("model.nebt_nonprismatic")
        if "spring" in self.supports:
            # One rotational stiffness per support (kN m/rad); only the
            # "spring" entries are used, the others are ignored.
            if len(self.support_springs) != len(self.supports):
                raise ValueError("model.support_springs")
            if any(
                not 0 < k <= 1e13
                for k, s in zip(self.support_springs, self.supports)
                if s == "spring"
            ):
                raise ValueError("model.support_springs")
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
                    self.sections[i].kind in ("ei", "nebt")
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


def default_model() -> Model:
    """Starting model of the application (v0.9.2).

    Non-prismatic girder: S2 (deeper) only over the interior supports, reached
    by parabolic depth haunches over 20 % of each adjacent span, plates, E and
    M from the deeper section; S1 elsewhere, including at the abutments. The
    S6-25 truck load fraction is applied (interior girder, ULS).
    """
    model = Model(
        nonprismatic=True,
        sections=[Section(), Section(name="S2", depth=1560)],
    )
    apply_default_haunches(model)
    return Model.model_validate(model.model_dump())


def apply_default_haunches(model: Model, deep: int = 1, length: float = 0.2):
    """Parabolic haunches to section ``deep`` at every interior support only."""
    n = len(model.spans)
    for i, span in enumerate(model.spans):
        shallow = span.section if span.section != deep else 0
        zones = []
        if i > 0:
            zones.append(
                Zone(
                    end=length,
                    section=deep,
                    end_section=shallow,
                    profile="parabolic",
                    plates="deep",
                )
            )
        if i < n - 1:
            zones.append(Zone(end=1 - length, section=shallow))
            zones.append(
                Zone(
                    end=1,
                    section=shallow,
                    end_section=deep,
                    profile="parabolic",
                    plates="deep",
                )
            )
        else:
            zones.append(Zone(end=1, section=shallow))
        span.zones = zones
    return model
