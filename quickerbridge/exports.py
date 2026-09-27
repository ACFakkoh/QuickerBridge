"""CSV and Excel exports from the same immutable result shown in the viewer."""

import csv
from io import BytesIO, StringIO
import json

from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment

from .version import APP_VERSION, AUTHOR, RELEASE_DATE


WARNING = {
    "en": "Indicative preliminary values only — not a substitute for detailed design.",
    "fr": "Valeurs préliminaires indicatives seulement — ne remplacent pas une conception détaillée.",
}
HEADERS = {
    "en": [
        "Span",
        "Station",
        "x (m)",
        "Local x (m)",
        "Side",
        "V min (kN)",
        "V max (kN)",
        "M min (kN·m)",
        "M max (kN·m)",
        "Deflection min (mm, down +)",
        "Deflection max (mm, down +)",
        "R min (kN, up +)",
        "R max (kN, up +)",
    ],
    "fr": [
        "Travée",
        "Station",
        "x (m)",
        "x local (m)",
        "Côté",
        "V min (kN)",
        "V max (kN)",
        "M min (kN·m)",
        "M max (kN·m)",
        "Flèche min (mm, bas +)",
        "Flèche max (mm, bas +)",
        "R min (kN, haut +)",
        "R max (kN, haut +)",
    ],
}
THERMAL_HEADERS = {
    "en": [
        "Span",
        "Station",
        "x (m)",
        "Local x (m)",
        "Side",
        "V (kN)",
        "M (kN·m)",
        "Deflection (mm, down +)",
        "R (kN, up +)",
    ],
    "fr": [
        "Travée",
        "Station",
        "x (m)",
        "x local (m)",
        "Côté",
        "V (kN)",
        "M (kN·m)",
        "Flèche (mm, bas +)",
        "R (kN, haut +)",
    ],
}


def rows(result, language):
    seen = set()
    for row in result["table"]:
        values = list(row.values())
        if language == "fr":
            values[4] = {"left": "gauche", "right": "droite"}[values[4]]
        reaction = next(
            (r for r in result["reactions"] if abs(r["x"] - row["x"]) < 1e-8), None
        )
        if reaction and reaction["support"] not in seen:
            values.extend([reaction["min"], reaction["max"]])
            seen.add(reaction["support"])
        else:
            values.extend([None, None])
        yield values


def thermal_rows(result, language):
    seen = set()
    for row in result["table"]:
        values = [
            row[key]
            for key in ("span", "station", "x", "local_x", "side", "V", "M", "D")
        ]
        if language == "fr":
            values[4] = {"left": "gauche", "right": "droite"}[values[4]]
        reaction = next(
            (r for r in result["reactions"] if abs(r["x"] - row["x"]) < 1e-8), None
        )
        if reaction and reaction["support"] not in seen:
            values.append(reaction["value"])
            seen.add(reaction["support"])
        else:
            values.append(None)
        yield values


def csv_bytes(result, language="en"):
    stream = StringIO(newline="")
    writer = csv.writer(stream)
    thermal = result.get("kind") == "thermal"
    writer.writerow((THERMAL_HEADERS if thermal else HEADERS)[language])
    writer.writerows((thermal_rows if thermal else rows)(result, language))
    return stream.getvalue().encode("utf-8-sig")


def excel_bytes(result, language="en"):
    thermal = result.get("kind") == "thermal"
    wb = Workbook()
    ws = wb.active
    ws.title = "Stations"
    ws.append((THERMAL_HEADERS if thermal else HEADERS)[language])
    for row in (thermal_rows if thermal else rows)(result, language):
        ws.append(row)
    rx = wb.create_sheet("Réactions" if language == "fr" else "Reactions")
    rx.append(
        [
            "Appui" if language == "fr" else "Support",
            "x (m)",
            "R (kN)" if thermal else "R min (kN)",
        ]
    )
    if not thermal:
        rx.cell(1, 4, "R max (kN)")
    fixed = any(r.get("type") in ("fixed", "spring") for r in result["reactions"])
    if fixed:
        # Integral (fixed) abutments also carry a moment reaction, CCW +.
        column = 4 if thermal else 5
        labels = (
            ["Mr (kN·m, anti-horaire +)"] if language == "fr" else ["Mr (kN·m, CCW +)"]
        )
        if not thermal:
            labels = [
                label.replace("Mr", name)
                for name in ("Mr min", "Mr max")
                for label in labels
            ]
        for offset, label in enumerate(labels):
            rx.cell(1, column + offset, label)
        rx.cell(1, column + len(labels), "Type")
    for r in result["reactions"]:
        row = (
            [r["support"], r["x"], r["value"]]
            if thermal
            else [r["support"], r["x"], r["min"], r["max"]]
        )
        if fixed:
            row += (
                [r.get("moment", 0.0)]
                if thermal
                else [r.get("moment_min", 0.0), r.get("moment_max", 0.0)]
            )
            kind = r.get("type", "")
            if kind == "spring":
                kind = f"spring k={r['k']:,.0f} kN·m/rad ({100 * r['fixity']:.0f}%)"
            row.append(kind)
        rx.append(row)
    if not thermal:
        cases = wb.create_sheet(
            "Cas déterminants" if language == "fr" else "Governing cases"
        )
        cases.append(
            [
                "x (m)",
                "Side / Côté",
                "Effect / Effet",
                "Min/Max",
                "Value / Valeur",
                "Case / Cas",
                "Axles / Essieux",
                "DLA factor / Facteur CMD",
                "Load factor / Facteur de charge",
                "Axle factor / Facteur d’essieu",
                "Front axle x / x essieu avant (m)",
                "Direction",
            ]
        )
        nx = len(result["x"])
        for effect, offset in (("V", 0), ("M", nx), ("D", 2 * nx)):
            for i, x in enumerate(result["x"]):
                for sense in ("min", "max"):
                    case = result["case_" + sense][offset + i]
                    cases.append(
                        [
                            x,
                            result["sides"][i],
                            effect,
                            sense,
                            result[sense][effect][i],
                            case["case"],
                            "–".join(map(str, case["axles"])),
                            case["factor"],
                            result["model"]["live"].get("factor", 1),
                            result["model"]["live"].get("axle_factor", 1),
                            case["position"],
                            case["direction"],
                        ]
                    )
    meta = wb.create_sheet("Modèle" if language == "fr" else "Model")
    meta.append(["QuickerBridge", APP_VERSION])
    meta.append(["Warning / Avertissement", WARNING[language]])
    meta.append(["Version", f"QuickerBridge {APP_VERSION} · {RELEASE_DATE} · {AUTHOR}"])
    if thermal:
        thermal_input = result["model"]["thermal"]
        meta.append(
            ["Load case / Cas", "Thermal gradient only / Gradient thermique seulement"]
        )
        meta.append(["ΔT = Ttop − Tbottom (°C)", thermal_input["delta_T"]])
        meta.append(["α (10⁻⁶/°C)", thermal_input["alpha_micro"]])
        meta.append(["Thermal depth / Hauteur thermique (mm)", thermal_input["depth"]])
        meta.append(
            ["Imposed curvature / Courbure imposée (1/m)", result["meta"]["curvature"]]
        )
    else:
        vehicle = result["model"]["live"]["vehicle"]
        dynamic_reference = (
            "CAN/CSA S6-25 · 3.8.4.5.3"
            if vehicle in ("CL625", "CL750QC")
            else "AASHTO LRFD · 33% on axles"
            if vehicle in ("HL93Truck", "HL93Tandem")
            else "None / Aucun"
            if vehicle in ("Cooper", "Maintenance")
            else "User selection / Choix utilisateur"
        )
        meta.append(["Dynamic allowance / CMD", dynamic_reference])
        meta.append(
            [
                "Live factors / Facteurs de surcharge",
                f"load/charge = {result['model']['live'].get('factor', 1)}; "
                f"axle/essieu = {result['model']['live'].get('axle_factor', 1)}",
            ]
        )
        meta.append(
            [
                "Dead factors / Facteurs permanents",
                "; ".join(
                    f"{load['name']} = {load.get('factor', 1)}"
                    for load in result["model"]["dead"]
                ),
            ]
        )
    meta.append(
        [
            "Scope / Portée",
            "1-D Euler–Bernoulli; one lane / une voie; gross homogeneous I-section / section en I homogène brute",
        ]
    )
    if not thermal:
        meta.append(
            [
                "Factors / Facteurs",
                "Code dynamic/lane factors and the user load/axle factors are applied separately.",
            ]
        )
        meta.append(
            [
                "Lane / Voie",
                "Standard vehicles: companion UDL over the full bridge. Custom vehicle: adverse regions.",
            ]
        )
        meta.append(
            [
                "Envelope / Enveloppe",
                "Each station/effect can have a different governing arrangement. Reactions are reported once per support.",
            ]
        )
    meta.append(["PyCBA", result["meta"]["pycba"]])
    if not thermal:
        meta.append(["Travel step / Pas (m)", result["meta"]["travel_step"]])
    meta.append(["Model JSON", json.dumps(result["model"], ensure_ascii=False)])
    for sheet in wb:
        sheet.freeze_panes = "A2"
        sheet.auto_filter.ref = sheet.dimensions
        for cell in sheet[1]:
            cell.fill = PatternFill("solid", fgColor="102D41")
            cell.font = Font(color="FFFFFF", bold=True)
            cell.alignment = Alignment(wrap_text=True, vertical="center")
        sheet.row_dimensions[1].height = 32
        for column in sheet.columns:
            sheet.column_dimensions[column[0].column_letter].width = 20
            for cell in column[1:]:
                if isinstance(cell.value, (float, int)):
                    cell.number_format = "0.000"
                if isinstance(cell.value, str) and cell.value.startswith(
                    ("=", "+", "-", "@")
                ):
                    cell.value = "'" + cell.value
        sheet.sheet_view.showGridLines = False
    meta.column_dimensions["A"].width = 30
    meta.column_dimensions["B"].width = 100
    for row in meta.iter_rows(min_row=2):
        row[1].alignment = Alignment(wrap_text=True, vertical="top")
        meta.row_dimensions[row[0].row].height = 48
    buffer = BytesIO()
    wb.save(buffer)
    return buffer.getvalue()
