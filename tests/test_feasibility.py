import unittest

from src.feasibility import DesignInputs, evaluate


class FeasibilityTests(unittest.TestCase):
    def test_reference_design_fits_the_55_lb_takeoff_constraint_with_margin(self) -> None:
        inputs = DesignInputs()
        result = evaluate(inputs)
        self.assertEqual(inputs.takeoff_weight_lb, 54.0)
        self.assertGreater(result.dry_aircraft_weight_allowance_lb, 16.0)
        self.assertLess(inputs.takeoff_weight_lb, 55.0)

    def test_reference_design_completes_a_ten_mile_screening_mission(self) -> None:
        result = evaluate()
        self.assertLess(result.mission_energy_wh, result.dispatch_energy_wh)
        self.assertGreater(result.mission_margin_fraction, 0.20)
        self.assertGreater(result.modeled_max_range_mi, 10.0)

    def test_invalid_efficiency_is_rejected(self) -> None:
        with self.assertRaises(ValueError):
            evaluate(DesignInputs(figure_of_merit=0))


if __name__ == "__main__":
    unittest.main()
