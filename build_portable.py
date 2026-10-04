"""Build browser assets, portable HTML, and deterministic release packages."""

import argparse
import base64
from datetime import date
import hashlib
from io import BytesIO
import json
import re
from pathlib import Path
import runpy
import shutil
import zipfile


ROOT = Path(__file__).resolve().parent
DIST = ROOT / "dist"
RELEASE = ROOT / "release"
META = runpy.run_path(str(ROOT / "quickerbridge" / "version.py"))
VERSION = META["APP_VERSION"]
RELEASE_DATE = META["RELEASE_DATE"]
AUTHOR = META["AUTHOR"]
release_day = date.fromisoformat(RELEASE_DATE)
# The portable application is always named with its version and release date.
PORTABLE_NAME = f"QuickerBridge-v{VERSION}-{RELEASE_DATE}.html"
ZIP_TIME = (release_day.year, release_day.month, release_day.day, 0, 0, 0)


def project_schema_version():
    # One project schema for Python and the browser (audit 2026-10-01).
    text = (ROOT / "quickerbridge" / "projects.py").read_text(encoding="utf-8")
    return int(re.search(r"SCHEMA_VERSION = (\d+)", text).group(1))


def zip_bytes(entries) -> bytes:
    """Create a reproducible ZIP from `(path, archive-name)` entries."""
    buffer = BytesIO()
    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as archive:
        for path, name in sorted(entries, key=lambda item: item[1]):
            info = zipfile.ZipInfo(name.replace("\\", "/"), ZIP_TIME)
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            archive.writestr(info, path.read_bytes())
    return buffer.getvalue()


def python_sources():
    entries = [(ROOT / "vendor/pycba/LICENSE", "pycba-LICENSE.txt")]
    for folder, prefix in (
        (ROOT / "quickerbridge", "quickerbridge"),
        (ROOT / "vendor/pycba/src/pycba", "pycba"),
    ):
        for path in folder.rglob("*.py"):
            if path.name == "server.py":
                continue
            entries.append((path, f"{prefix}/{path.relative_to(folder).as_posix()}"))
    return entries


def source_entries():
    entries = []
    root_files = (
        ".gitignore",
        "README.md",
        "README.fr.md",
        "README_DEVELOPER.md",
        "NONPRISMATIC.md",
        "THIRD_PARTY_NOTICES.md",
        "VALIDATION.md",
        "requirements.txt",
        "build_portable.py",
        "QuickerBridge.cmd",
        "launch.py",
        "pycba-cl750qc.patch",
        "pycba-nonprismatic-performance.patch",
        "pycba-pinned-pinned-shear.patch",
    )
    for name in root_files:
        entries.append((ROOT / name, name))
    for pattern in (
        "quickerbridge/*.py",
        "tests/*.py",
        "examples/*.quickerbridge.json",
        "docs/screenshots/*",
        ".github/workflows/*.yml",
    ):
        entries.extend(
            (path, path.relative_to(ROOT).as_posix()) for path in ROOT.glob(pattern)
        )
    for name in (
        "index.html",
        "styles.css",
        "app.js",
        "modes.js",
        "comparison.js",
        "axle.js",
        "sections.js",
        "browser-solver.js",
        "version.js",
        "default-result.js",
        "examples.js",
        "solver-bundle.js",
    ):
        entries.append((DIST / name, f"dist/{name}"))
    vendor_root = ROOT / "vendor/pycba"
    for path in (vendor_root / "src/pycba").rglob("*.py"):
        entries.append((path, path.relative_to(ROOT).as_posix()))
    for name in (
        ".gitattributes",
        ".gitignore",
        "CHANGELOG.md",
        "LICENSE",
        "README.md",
        "pyproject.toml",
        "setup.py",
        "tests/test_cl750qc.py",
        "tests/test_nonprismatic.py",
    ):
        entries.append((vendor_root / name, f"vendor/pycba/{name}"))
    unique = {name: path for path, name in entries if path.is_file()}
    return [(path, name) for name, path in unique.items()]


def write_zip(path: Path, entries) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(zip_bytes(entries))


def write_default_result() -> None:
    """Pre-compute the default model so the first screen needs no Python.

    The browser shows these results immediately while Pyodide, NumPy and SciPy
    load in the background; the engine recomputes them silently once ready,
    so snapshots, influence lines and exports use a live result.
    """
    import sys

    sys.path.insert(0, str(ROOT))
    from quickerbridge.engine import analyse
    from quickerbridge.models import default_model

    model = default_model()
    payload = {
        "version": VERSION,
        "model": model.model_dump(),
        "result": analyse(model),
    }
    payload["result"]["meta"]["elapsed"] = 0.0
    (DIST / "default-result.js").write_text(
        "window.QB_DEFAULT="
        + json.dumps(payload, separators=(",", ":"), allow_nan=False)
        + ";\n",
        encoding="utf-8",
    )


def write_examples() -> None:
    """Example bridges of the project menu (v0.9.8): dist/examples.js and one
    project file per example in examples/."""
    import sys

    sys.path.insert(0, str(ROOT))
    from quickerbridge.models import Model
    from quickerbridge.presets import presets
    from quickerbridge.projects import create_project

    items = presets()
    (DIST / "examples.js").write_text(
        "window.QB_EXAMPLES="
        + json.dumps(items, separators=(",", ":"), ensure_ascii=False)
        + ";\n",
        encoding="utf-8",
    )
    for item in items:
        project = create_project(
            Model.model_validate(item["model"]), item["name"]["fr"]
        )
        project["saved_at"] = f"{RELEASE_DATE}T00:00:00Z"
        (ROOT / "examples" / f"example-{item['id']}.quickerbridge.json").write_text(
            json.dumps(project, indent=2, ensure_ascii=False) + "\n",
            encoding="utf-8",
        )


def build_browser_assets() -> None:
    source = (
        "window.QB_SOURCE_ZIP="
        + json.dumps(base64.b64encode(zip_bytes(python_sources())).decode())
        + ";\n"
    )
    DIST.mkdir(exist_ok=True)
    (DIST / "solver-bundle.js").write_text(source, encoding="utf-8")
    version_js = (
        "window.QB_META="
        + json.dumps(
            {
                "version": VERSION,
                "date": RELEASE_DATE,
                "author": AUTHOR,
                "schema": project_schema_version(),
            },
            ensure_ascii=False,
        )
        + ";\n"
    )
    (DIST / "version.js").write_text(version_js, encoding="utf-8")
    write_default_result()
    write_examples()
    (DIST / ".nojekyll").touch()

    html = (DIST / "index.html").read_text(encoding="utf-8")
    html = html.replace(
        '<link rel="stylesheet" href="./styles.css">',
        "<style>" + (DIST / "styles.css").read_text(encoding="utf-8") + "</style>",
    )
    script_names = (
        "version.js",
        "default-result.js",
        "examples.js",
        "solver-bundle.js",
        "browser-solver.js",
        "app.js",
        "modes.js",
        "comparison.js",
        "axle.js",
        "sections.js",
    )
    for filename in script_names:
        html = html.replace(f'<script src="./{filename}" defer></script>', "")
    html = "\n".join("" if not line.strip() else line for line in html.split("\n"))
    scripts = "\n".join(
        (DIST / filename).read_text(encoding="utf-8") for filename in script_names
    )
    html = html.replace(
        "</body>",
        "<script>" + scripts.replace("</script", "<\\/script") + "</script>\n</body>",
    )
    for stale in ROOT.glob("QuickerBridge*.html"):
        if stale.name != PORTABLE_NAME:
            stale.unlink()
    (ROOT / PORTABLE_NAME).write_text(html, encoding="utf-8")
    # Double-click launcher for the portable package, pointing at this build.
    (ROOT / "QuickerBridge.cmd").write_text(
        f'@echo off\r\nstart "" "%~dp0{PORTABLE_NAME}"\r\n',
        encoding="utf-8",
        newline="",
    )


def clean_release_directory() -> Path:
    resolved = RELEASE.resolve()
    if resolved.parent != ROOT.resolve() or resolved.name != "release":
        raise RuntimeError("Unsafe release path")
    if RELEASE.exists():
        shutil.rmtree(RELEASE)
    RELEASE.mkdir()
    stage = RELEASE / f"QuickerBridge-v{VERSION}-source"
    stage.mkdir()
    return stage


def build_release() -> None:
    entries = source_entries()
    source_zip = DIST / "QuickerBridge-source.zip"
    write_zip(source_zip, entries)

    stage = clean_release_directory()
    for path, name in entries:
        destination = stage / name
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(path, destination)

    release_source = RELEASE / f"QuickerBridge-v{VERSION}-source.zip"
    shutil.copy2(source_zip, release_source)
    pages_entries = [
        (DIST / name, name)
        for name in (
            "index.html",
            "styles.css",
            "app.js",
            "modes.js",
            "comparison.js",
            "axle.js",
            "sections.js",
            "browser-solver.js",
            "version.js",
            "default-result.js",
            "examples.js",
            "solver-bundle.js",
            "QuickerBridge-source.zip",
            ".nojekyll",
        )
    ]
    pages_zip = RELEASE / f"QuickerBridge-v{VERSION}-pages.zip"
    write_zip(pages_zip, pages_entries)
    portable_entries = [
        (ROOT / PORTABLE_NAME, PORTABLE_NAME),
        (ROOT / "QuickerBridge.cmd", "QuickerBridge.cmd"),
        (ROOT / "README.md", "README.md"),
        (ROOT / "README.fr.md", "README.fr.md"),
        (ROOT / "README_DEVELOPER.md", "README_DEVELOPER.md"),
        (ROOT / "NONPRISMATIC.md", "NONPRISMATIC.md"),
        (ROOT / "VALIDATION.md", "VALIDATION.md"),
        (ROOT / "THIRD_PARTY_NOTICES.md", "THIRD_PARTY_NOTICES.md"),
        (ROOT / "vendor/pycba/LICENSE", "pycba-LICENSE.txt"),
    ]
    portable_entries += [
        (path, f"examples/{path.name}")
        for path in sorted((ROOT / "examples").glob("*"))
    ]
    portable_zip = RELEASE / f"QuickerBridge-v{VERSION}-portable.zip"
    write_zip(portable_zip, portable_entries)

    manifest_lines = [
        f"QuickerBridge v{VERSION} · {RELEASE_DATE} · {AUTHOR}",
        "",
        "Source tree allowlist:",
        *[name for _, name in sorted(entries, key=lambda item: item[1])],
    ]
    (RELEASE / "MANIFEST.txt").write_text(
        "\n".join(manifest_lines) + "\n", encoding="utf-8"
    )
    checksum_lines = [
        f"{hashlib.sha256(path.read_bytes()).hexdigest()}  {path.name}"
        for path in (portable_zip, pages_zip, release_source)
    ]
    (RELEASE / "SHA256SUMS.txt").write_text(
        "\n".join(checksum_lines) + "\n", encoding="ascii"
    )


def build(with_release: bool = True) -> None:
    build_browser_assets()
    if with_release:
        build_release()
    else:
        write_zip(DIST / "QuickerBridge-source.zip", source_entries())
    suffix = ", and release packages." if with_release else "."
    print(f"Built QuickerBridge v{VERSION}: portable HTML, static dist/{suffix}")


def deliver(destination: Path) -> None:
    """Copy generated deliverables into a personal distribution folder."""
    destination = destination.resolve()
    destination.mkdir(parents=True, exist_ok=True)
    if destination != ROOT.resolve():
        shutil.copy2(ROOT / PORTABLE_NAME, destination / PORTABLE_NAME)
    public = destination / "GitHub"
    public.mkdir(exist_ok=True)
    for path in RELEASE.iterdir():
        target = public / path.name
        if path.is_dir():
            shutil.copytree(path, target, dirs_exist_ok=True)
        else:
            shutil.copy2(path, target)
    print(f"Delivered HTML and GitHub packages to {destination}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--no-release",
        action="store_true",
        help="Build browser assets without release/.",
    )
    parser.add_argument(
        "--deliver", type=Path, help="Copy HTML and releases to this folder."
    )
    args = parser.parse_args()
    if args.no_release and args.deliver:
        parser.error("--deliver requires a complete release build")
    build(with_release=not args.no_release)
    if args.deliver:
        deliver(args.deliver)
