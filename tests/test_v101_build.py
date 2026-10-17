"""v1.01: the interface files listed once, loaded and inlined in one order."""

import re
import runpy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BUILD = runpy.run_path(str(ROOT / "build_portable.py"))


def test_index_lists_build_files_in_order():
    html = (ROOT / "dist" / "index.html").read_text(encoding="utf-8")
    scripts = re.findall(r'<script src="\./([^"]+)" defer></script>', html)
    styles = re.findall(r'<link rel="stylesheet" href="\./([^"]+)">', html)
    assert tuple(scripts) == BUILD["SCRIPTS"]
    assert tuple(styles) == BUILD["STYLES"]


def test_listed_files_exist_and_old_files_are_gone():
    dist = ROOT / "dist"
    for name in BUILD["STYLES"] + BUILD["APP_SCRIPTS"] + BUILD["MODULES"]:
        assert (dist / name).is_file(), name
    assert not (dist / "app.js").exists()
    assert not (dist / "styles.css").exists()


def test_every_app_script_is_strict():
    for name in BUILD["APP_SCRIPTS"]:
        text = (ROOT / "dist" / name).read_text(encoding="utf-8")
        assert text.startswith('"use strict";'), name
