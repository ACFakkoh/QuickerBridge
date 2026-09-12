import numpy as np

from pycba import VehicleLibrary


def test_quebec_truck_is_not_a_scaled_cl625():
    vehicle = VehicleLibrary.CA.get_cl750qc()
    np.testing.assert_array_equal(vehicle.axw, [50, 160, 160, 200, 180])
    np.testing.assert_array_equal(vehicle.axs, [3.6, 1.2, 6.6, 6.6])
    assert vehicle.W == 750
    assert vehicle.L == 18
    vehicle.axw[0] = 0
    assert VehicleLibrary.CA.get_cl750qc().axw[0] == 50
