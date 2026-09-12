"""Reproducible native timing; optionally compare a previous wrapper checkout."""

import argparse
import json
from pathlib import Path
import sys
import time

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument("--baseline", type=Path)
parser.add_argument("--output", type=Path, default=ROOT / "tmp/performance.json")
args = parser.parse_args()
sys.path.insert(0, str((args.baseline or ROOT).resolve()))

from quickerbridge.models import Model, Section, Zone
from quickerbridge.engine import Basis

m = Model(
    nonprismatic=True,
    sections=[
        Section(
            depth=h,
            top_width=600,
            top_thickness=30,
            web_thickness=16,
            bottom_width=650,
            bottom_thickness=40,
        )
        for h in (1200, 1800)
    ],
)
for span in m.spans:
    span.length = 30
    span.zones = [
        Zone(end=0.2, section=1, end_section=0, profile="parabolic"),
        Zone(end=0.8, section=0),
        Zone(end=1, section=0, end_section=1, profile="parabolic"),
    ]
started = time.perf_counter()
basis = Basis(m).build()
report = {
    "basis_seconds": time.perf_counter() - started,
    "influence_samples": [len(f.x) for f in basis.interpolators],
    "responses": basis.unit([2.345, 12.345, 32.345, 52.345]).tolist(),
}
args.output.parent.mkdir(parents=True, exist_ok=True)
args.output.write_text(json.dumps(report), encoding="utf-8")
print(json.dumps({k: v for k, v in report.items() if k != "responses"}), flush=True)
