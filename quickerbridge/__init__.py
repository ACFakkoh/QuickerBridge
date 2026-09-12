"""QuickerBridge: local continuous bridge beam analysis."""

import os
from pathlib import Path

# Keep Matplotlib's required font cache inside this local project.
os.environ.setdefault(
    "MPLCONFIGDIR", str(Path(__file__).resolve().parents[1] / "tmp" / "matplotlib")
)
os.environ.setdefault("MPLBACKEND", "Agg")

from .version import APP_VERSION as __version__
