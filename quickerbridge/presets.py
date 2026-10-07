"""Ready-made example bridges offered in the project menu (v0.9.8).

Anonymous models, S6-25 truck load fraction FT never applied. The build
writes them to ``dist/examples.js`` and ``examples/*.quickerbridge.json``.
"""

from .models import Model
from .sections import properties


def _section(**data):
    return {"name": "S1", "kind": "girder", **data}


def two_span_steel() -> Model:
    """Historic default: 2 × 34.8 m composite steel girder, haunches to 1800 mm."""
    zones_1 = [
        {"end": 0.8, "section": 0, "end_section": 0, "profile": "constant"},
        {
            "end": 1,
            "section": 0,
            "end_section": 1,
            "profile": "parabolic",
            "plates": "deep",
        },
    ]
    zones_2 = [
        {"end": 0.2, "section": 1, "end_section": 0, "profile": "parabolic"},
        {"end": 1, "section": 0, "end_section": 0, "profile": "constant"},
    ]
    return Model.model_validate(
        {
            "spans": [
                {"length": 34.8, "section": 0, "zones": zones_1},
                {"length": 34.8, "section": 0, "zones": zones_2},
            ],
            "supports": ["roller", "pin", "roller"],
            # v0.9.99: the historic M = 3.92 / 1.12 are the composite 1n
            # (3.91) and cracked I′ (1.09) inertias of the default slab.
            "sections": [
                _section(depth=1200, composite={}, inertia_source="1n"),
                _section(
                    name="S2",
                    depth=1800,
                    top_width=600,
                    top_thickness=50,
                    composite={"region": "negative"},
                    inertia_source="negative",
                ),
            ],
            "nonprismatic": True,
            "dead": [{"name": "Charge permanente", "w": 10, "stage": "3n"}],
            "live": {"vehicle": "CL750QC"},
        }
    )


def three_span_nebt() -> Model:
    """3 spans 30-35-30 m, NEBT 1600 girders, CL-625."""
    return Model.model_validate(
        {
            "spans": [{"length": 30.0}, {"length": 35.0}, {"length": 30.0}],
            "supports": ["roller", "pin", "roller", "roller"],
            "sections": [{"name": "NEBT 1600", "kind": "nebt", "nebt": "NEBT1600"}],
            "dead": [
                {"name": "Charges permanentes superposées", "w": 12, "stage": "3n"}
            ],
            "live": {"vehicle": "CL625"},
        }
    )


def integral_steel() -> Model:
    """Single 25 m integral span, 1400 mm steel girder, ~75 % end fixity."""
    section = _section(
        depth=1400,
        top_width=400,
        top_thickness=30,
        web_thickness=16,
        bottom_width=500,
        bottom_thickness=45,
    )
    model = Model.model_validate(
        {
            "spans": [{"length": 25.0}],
            "supports": ["spring", "spring"],
            "support_springs": [1.0, 1.0],
            "sections": [section],
            "dead": [{"name": "Charge permanente", "w": 10, "stage": "3n"}],
            "live": {"vehicle": "CL750QC"},
        }
    )
    # Fixity k / (k + 3EI/L) = 75 %  <=>  k = 9 EI / L.
    ei = properties(model.sections[0])["EI"]
    k = float(f"{9 * ei / 25.0:.2g}")
    model.support_springs = [k, k]
    return Model.model_validate(model.model_dump())


def single_span_ei() -> Model:
    """17 m single span, direct-EI composite section, CL-625."""
    return Model.model_validate(
        {
            "spans": [{"length": 17.0}],
            "supports": ["roller", "roller"],
            "sections": [
                {
                    "name": "S1",
                    "kind": "ei",
                    "nebt": "NEBT1400",
                    "EI": 896402,
                }
            ],
            "dead": [
                {
                    "name": "Charge permanente",
                    "w": 21.12,
                    "stage": "steel",
                }
            ],
            "live": {
                "vehicle": "CL625",
                "factor": 0.9,
            },
            "thermal": {"depth_source": "manual", "depth": 1200},
            "distribution": {
                "bridge_type": "slab",
                "slab_width": 9,
                "girders": 5,
                "spacing": 3.11,
                "carriageway": 7.4,
                "skew": 13,
            },
        }
    )


PRESETS = (
    (
        "two-span-steel",
        {
            "fr": "2 travées acier 34,8 m · CL-750-QC",
            "en": "2 steel spans 34.8 m · CL-750-QC",
        },
        {
            "fr": "Poutre d’acier continue, goussets paraboliques jusqu’à 1800 mm sur la pile (modèle historique).",
            "en": "Continuous steel girder, parabolic haunches to 1800 mm over the pier (historic model).",
        },
        two_span_steel,
    ),
    (
        "three-span-nebt",
        {
            "fr": "3 travées NEBT 1600 · 30-35-30 m · CL-625",
            "en": "3 NEBT 1600 spans · 30-35-30 m · CL-625",
        },
        {
            "fr": "Poutres précontraintes NEBT 1600 rendues continues, f′c 50 MPa.",
            "en": "NEBT 1600 prestressed girders made continuous, f′c 50 MPa.",
        },
        three_span_nebt,
    ),
    (
        "integral-steel",
        {
            "fr": "Pont intégral 25 m · acier 1400 · encastrement ≈ 75 %",
            "en": "Integral bridge 25 m · steel 1400 · ≈ 75 % fixity",
        },
        {
            "fr": "Une travée, ressorts de rotation aux culées (k = 9 EI / L, fixité 75 %).",
            "en": "Single span, rotational springs at the abutments (k = 9 EI / L, 75 % fixity).",
        },
        integral_steel,
    ),
    (
        "single-span-ei",
        {
            "fr": "1 travée 17 m · EI direct · CL-625",
            "en": "1 span 17 m · direct EI · CL-625",
        },
        {
            "fr": "Travée simple, rigidité EI saisie directement, facteur de charge 0,9.",
            "en": "Simple span, EI entered directly, load factor 0.9.",
        },
        single_span_ei,
    ),
)


def presets() -> list[dict]:
    """Example models for the browser menu (FT disabled in every one)."""
    out = []
    for key, name, description, build in PRESETS:
        model = build()
        assert not model.distribution.enabled and not model.distribution.apply
        out.append(
            {
                "id": key,
                "name": name,
                "description": description,
                "model": model.model_dump(mode="json"),
            }
        )
    return out
