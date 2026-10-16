"""Mesh convergence study (v1.0): speed vs accuracy of the travel step and of
the influence sampling, against a very fine reference. Manual report, not a
regression test:  python tests/mesh_study.py  (about one minute).

Error = max |envelope - reference| / max |reference|, per response, over the
min and max envelopes of every station.
"""

import time

import numpy as np

from quickerbridge import engine
from quickerbridge.engine import analyse
from quickerbridge.models import LiveLoad, Model, Span

REFERENCE = {"step": 0.02, "samples": 192, "npts": 1920, "grid": 641}


def bridges():
    live = {"load_mode": "live"}
    yield "2 x 10 m", Model(spans=[Span(length=10), Span(length=10)], **live)
    yield "2 x 34.8 m (default)", Model(**live)
    yield "20-25-20 m", Model(
        spans=[Span(length=20), Span(length=25), Span(length=20)],
        supports=["roller", "pin", "roller", "roller"],
        **live,
    )
    yield "12-40-12 m", Model(
        spans=[Span(length=12), Span(length=40), Span(length=12)],
        supports=["roller", "pin", "roller", "roller"],
        **live,
    )
    yield "60-80-60 m", Model(
        spans=[Span(length=60), Span(length=80), Span(length=60)],
        supports=["roller", "pin", "roller", "roller"],
        **live,
    )
    yield "5 x 12 m, 7 axles", Model(
        spans=[Span(length=12)] * 5,
        supports=["pin"] + ["roller"] * 5,
        live=LiveLoad(vehicle="custom", weights=[80] * 7, spacings=[1.2] * 6),
        **live,
    )


def run(model, override):
    engine.MESH_OVERRIDE = override
    engine.cached_basis.cache_clear()
    tick = time.perf_counter()
    result = analyse(model)
    engine.MESH_OVERRIDE = None
    return result, time.perf_counter() - tick


def errors(result, reference):
    out = {}
    for key in ("M", "V", "D", "R"):
        ref = np.r_[reference["min"][key], reference["max"][key]]
        val = np.r_[result["min"][key], result["max"][key]]
        out[key] = float(np.max(np.abs(val - ref)) / max(np.max(np.abs(ref)), 1e-12))
    return out


def main():
    candidates = [
        ("step 0.25 m (old standard)", {"step": 0.25}),
        ("step 0.10 m (old fine)", {"step": 0.10}),
        ("step Lmin/40", "L40"),
        ("step Lmin/80 [0.05, 0.25]", "auto"),
        ("step Lmin/160", "L160"),
        ("samples 24", {"samples": 24}),
        ("samples 48", {"samples": 48}),
        ("samples 96 (old fine)", {"samples": 96}),
        ("npts 480", {"npts": 480}),
        ("old standard (all)", {"step": 0.25, "samples": 48, "npts": 480, "grid": 161}),
        ("old fine (all)", {"step": 0.10, "samples": 96, "npts": 960, "grid": 321}),
        ("v1.0 auto (all)", {}),
    ]
    for name, model in bridges():
        lmin = min(s.length for s in model.spans)
        reference, t_ref = run(model, REFERENCE)
        print(f"\n## {name}  (Lmin {lmin:g} m, reference {t_ref:.2f} s)")
        print(f"{'case':30s} {'time s':>7s} " + " ".join(f"{k:>9s}" for k in "MVDR"))
        for label, spec in candidates:
            if spec == "auto":
                override = {**REFERENCE, "step": min(0.25, max(0.05, lmin / 80))}
            elif spec == "L40":
                override = {**REFERENCE, "step": lmin / 40}
            elif spec == "L160":
                override = {**REFERENCE, "step": lmin / 160}
            elif label.endswith("(all)"):
                override = spec or None
            else:
                override = {**REFERENCE, **spec}
            result, seconds = run(model, override)
            e = errors(result, reference)
            print(
                f"{label:30s} {seconds:7.2f} "
                + " ".join(f"{100 * e[k]:8.3f}%" for k in "MVDR")
            )


if __name__ == "__main__":
    main()
