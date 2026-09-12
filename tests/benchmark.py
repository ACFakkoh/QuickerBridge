"""Manual convergence/performance report, separate from fast regression tests."""
import json
from pathlib import Path
import numpy as np
from quickerbridge.engine import analyse
from quickerbridge.models import Model, Section, Span, Zone, LiveLoad
from quickerbridge.sections import properties


def peaks(result):
    return {
        k: [min(result["min"][k]), max(result["max"][k])] for k in ("V", "M", "D", "R")
    }


def main():
    report = {"steel_default": properties(Section())}
    for label, model in (
        ("default", Model()),
        (
            "parabolic",
            Model(
                nonprismatic=True,
                sections=[Section(), Section(depth=2400)],
                spans=[
                    Span(
                        length=24,
                        zones=[
                            Zone(
                                end=0.3, section=1, end_section=0, profile="parabolic"
                            ),
                            Zone(end=1, section=0),
                        ],
                    ),
                    Span(length=33),
                ],
            ),
        ),
    ):
        a = analyse(model)
        model.precision = "fine"
        b = analyse(model)
        pa, pb = peaks(a), peaks(b)
        report[label] = {
            "standard": pa,
            "fine": pb,
            "seconds": [a["meta"]["elapsed"], b["meta"]["elapsed"]],
            "relative_change": {
                k: float(
                    np.max(abs(np.array(pa[k]) - pb[k])) / max(abs(np.array(pb[k])))
                )
                for k in pa
            },
        }
    model = Model(
        spans=[Span(length=12)] * 5,
        supports=["pin"] + ["roller"] * 5,
        live=LiveLoad(vehicle="custom", weights=[80] * 7, spacings=[1.2] * 6),
        load_mode="live",
    )
    r = analyse(model)
    report["five_span_seven_axle"] = {"meta": r["meta"], "peaks": peaks(r)}
    target = Path("tmp/validation-report.json")
    target.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2), flush=True)


if __name__ == "__main__":
    main()
