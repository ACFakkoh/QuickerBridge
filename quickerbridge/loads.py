"""Standard vehicle definitions and the code-specific moving-load cases."""

from itertools import combinations

import numpy as np
import pycba as cba

from .models import LiveLoad


CANADIAN_VEHICLES = {"CL625", "CL750QC"}
HL93_VEHICLES = {"HL93Truck", "HL93Tandem"}
FULL_VEHICLES = HL93_VEHICLES | {"Cooper", "Maintenance"}


def vehicle_data(live: LiveLoad, rear_spacing: float | None = None):
    """Return the nominal PyCBA axle pattern in kN and m.

    ``rear_spacing`` is used only by the variable-spacing HL-93 truck.  Its
    range is enveloped by :func:`vehicle_variants` during an analysis.
    """
    if live.vehicle == "CL625":
        veh = cba.VehicleLibrary.CA.get_cl625()
    elif live.vehicle == "CL750QC":
        veh = cba.VehicleLibrary.CA.get_cl750qc()
    elif live.vehicle == "HL93Truck":
        veh = cba.VehicleLibrary.US.get_hl93_truck(rear_spacing or 4.3)
    elif live.vehicle == "HL93Tandem":
        veh = cba.VehicleLibrary.US.get_hl93_tandem()
    elif live.vehicle == "Cooper":
        veh = cba.VehicleLibrary.US.get_cooper(live.cooper_e)
    elif live.vehicle == "Maintenance":
        veh = cba.Vehicle([2.0], [24.0, 56.0])
    else:
        veh = cba.Vehicle(live.spacings, live.weights)
    return np.asarray(veh.axw, float), np.asarray(veh.axle_coords, float)


def dynamic_factor(ids, enabled=True, canadian=True, vehicle: str | None = None):
    """Return the vehicle dynamic allowance without altering nominal weights."""
    if not enabled:
        return 1.0
    if vehicle in HL93_VEHICLES:
        # AASHTO LRFD HL-93: IM = 33% on truck/tandem point loads only.
        return 1.33
    if vehicle in {"Cooper", "Maintenance"}:
        return 1.0
    if len(ids) == 1:
        return 1.4
    if len(ids) == 2 or (canadian and tuple(ids) == (1, 2, 3)):
        return 1.3
    return 1.25


def axle_groups(live: LiveLoad):
    weights, offsets = vehicle_data(live)
    if live.vehicle in FULL_VEHICLES:
        ids = list(range(1, len(weights) + 1))
        return [
            {
                "axles": ids,
                "factor": dynamic_factor(ids, live.dynamic, False, live.vehicle),
                "mask": np.ones(len(weights)),
            }
        ]
    groups = []
    for n in range(1, len(weights) + 1):
        for ids in combinations(range(1, len(weights) + 1), n):
            mask = np.array([i + 1 in ids for i in range(len(weights))], float)
            factor = dynamic_factor(
                ids, live.dynamic, live.vehicle in CANADIAN_VEHICLES, live.vehicle
            )
            groups.append({"axles": list(ids), "factor": factor, "mask": mask})
    return groups


def vehicle_variants(live: LiveLoad):
    """Nominal axle patterns to include in one envelope.

    PyCBA defines the HL-93 rear axle spacing as variable from 4.3 to 9.0 m.
    QuickerBridge checks that full permitted range in 0.25 m increments.
    """
    if live.vehicle != "HL93Truck":
        weights, offsets = vehicle_data(live)
        return [(weights, offsets, {})]
    spacings = np.unique(np.r_[np.arange(4.3, 9.0, 0.25), 9.0])
    return [
        (*vehicle_data(live, float(spacing)), {"rear_spacing": float(spacing)})
        for spacing in spacings
    ]


def lane_parameters(live: LiveLoad):
    """Return the companion UDL and placement used by the selected model.

    ``full`` matches PyCBA's ``run_load_model(..., w_lane=...)`` companion UDL
    behavior. Only a user-defined custom vehicle retains optional adverse-region
    placement.
    """
    if live.vehicle == "CL625":
        return 9.0, 0.8, "full"
    if live.vehicle == "CL750QC":
        return 12.6, live.lane_fraction, "full"
    if live.vehicle in HL93_VEHICLES:
        return 9.3, 1.0, "full"
    if live.vehicle == "Cooper":
        # PyCBA documents E/10 kip/ft, i.e. about 1.46 E kN/m.
        return live.cooper_e / 10 * 4.4482216 / 0.3048, 1.0, "full"
    if live.vehicle == "Maintenance":
        return 0.0, 1.0, "none"
    return live.lane_w, live.lane_fraction, "patterned"


def lane_axle_factor(live: LiveLoad, truck_factor: float) -> float:
    """Point-load factor in a companion-lane case; the UDL is never amplified."""
    _, fraction, _ = lane_parameters(live)
    return truck_factor if live.vehicle in HL93_VEHICLES else fraction


def dead_intervals(model):
    starts = np.r_[0, np.cumsum([s.length for s in model.spans])]
    intervals = []
    for load in model.dead:
        for i, span in enumerate(model.spans):
            if load.span in (-1, i) and load.w:
                a = load.start * span.length
                b = load.end * span.length
                intervals.append(
                    {
                        "span": i,
                        "a": a,
                        "b": b,
                        "start": starts[i] + a,
                        "end": starts[i] + b,
                        "w": load.w * load.factor,
                        "input_w": load.w,
                        "factor": load.factor,
                        "name": load.name,
                    }
                )
    return intervals
