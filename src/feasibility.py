"""First-pass energy and mass model for the flagship drone.

This is a screening model, not a flight-release calculation. All design inputs
are explicit so test data can replace assumptions as prototype work advances.
"""
from __future__ import annotations

from dataclasses import asdict, dataclass
from math import pi, sqrt
from typing import Any

LB_PER_KG = 2.2046226218
G = 9.80665
AIR_DENSITY_KG_M3 = 1.225


@dataclass(frozen=True)
class DesignInputs:
    takeoff_weight_lb: float = 54.0
    payload_lb: float = 20.0
    rotor_count: int = 8
    rotor_diameter_in: float = 22.0
    figure_of_merit: float = 0.68
    cruise_power_fraction_of_hover: float = 0.82
    enclosure_cruise_penalty_kw: float = 0.25
    cruise_speed_mph: float = 30.0
    route_distance_mi: float = 10.0
    terminal_hover_minutes: float = 4.0
    pack_series: int = 14
    pack_parallel: int = 7
    cell_energy_wh: float = 18.0
    cell_mass_g: float = 71.0
    pack_overhead_fraction: float = 0.12
    dispatch_soc_fraction: float = 0.80
    powertrain_efficiency: float = 0.90


@dataclass(frozen=True)
class FeasibilityResult:
    rotor_disk_area_m2: float
    ideal_hover_power_kw: float
    estimated_hover_power_kw: float
    estimated_cruise_power_kw: float
    nominal_pack_energy_wh: float
    dispatch_energy_wh: float
    bare_cells_weight_lb: float
    packaged_battery_weight_lb: float
    dry_aircraft_weight_allowance_lb: float
    route_duration_min: float
    mission_energy_wh: float
    mission_energy_margin_wh: float
    mission_margin_fraction: float
    modeled_max_range_mi: float


def evaluate(inputs: DesignInputs = DesignInputs()) -> FeasibilityResult:
    """Evaluate a single all-up-weight-limited multirotor design point."""
    if not 0 < inputs.figure_of_merit <= 1:
        raise ValueError("figure_of_merit must be in (0, 1]")
    if not 0 < inputs.dispatch_soc_fraction <= 1:
        raise ValueError("dispatch_soc_fraction must be in (0, 1]")
    if not 0 < inputs.powertrain_efficiency <= 1:
        raise ValueError("powertrain_efficiency must be in (0, 1]")

    mass_kg = inputs.takeoff_weight_lb / LB_PER_KG
    weight_newtons = mass_kg * G
    rotor_diameter_m = inputs.rotor_diameter_in * 0.0254
    rotor_disk_area_m2 = inputs.rotor_count * pi * (rotor_diameter_m / 2) ** 2
    ideal_hover_power_w = weight_newtons**1.5 / sqrt(2 * AIR_DENSITY_KG_M3 * rotor_disk_area_m2)
    estimated_hover_power_kw = ideal_hover_power_w / inputs.figure_of_merit / 1000
    estimated_cruise_power_kw = (
        estimated_hover_power_kw * inputs.cruise_power_fraction_of_hover
        + inputs.enclosure_cruise_penalty_kw
    )

    cell_count = inputs.pack_series * inputs.pack_parallel
    nominal_pack_energy_wh = cell_count * inputs.cell_energy_wh
    dispatch_energy_wh = nominal_pack_energy_wh * inputs.dispatch_soc_fraction * inputs.powertrain_efficiency
    bare_cells_weight_lb = cell_count * inputs.cell_mass_g / 1000 * LB_PER_KG
    packaged_battery_weight_lb = bare_cells_weight_lb * (1 + inputs.pack_overhead_fraction)
    dry_aircraft_weight_allowance_lb = inputs.takeoff_weight_lb - inputs.payload_lb - packaged_battery_weight_lb

    route_duration_hr = inputs.route_distance_mi / inputs.cruise_speed_mph
    terminal_hover_hr = inputs.terminal_hover_minutes / 60
    mission_energy_wh = 1000 * (
        estimated_cruise_power_kw * route_duration_hr
        + estimated_hover_power_kw * terminal_hover_hr
    )
    mission_energy_margin_wh = dispatch_energy_wh - mission_energy_wh
    mission_margin_fraction = mission_energy_margin_wh / dispatch_energy_wh
    modeled_max_range_mi = max(
        0,
        (dispatch_energy_wh / 1000 - estimated_hover_power_kw * terminal_hover_hr)
        / estimated_cruise_power_kw
        * inputs.cruise_speed_mph,
    )

    return FeasibilityResult(
        rotor_disk_area_m2=rotor_disk_area_m2,
        ideal_hover_power_kw=ideal_hover_power_w / 1000,
        estimated_hover_power_kw=estimated_hover_power_kw,
        estimated_cruise_power_kw=estimated_cruise_power_kw,
        nominal_pack_energy_wh=nominal_pack_energy_wh,
        dispatch_energy_wh=dispatch_energy_wh,
        bare_cells_weight_lb=bare_cells_weight_lb,
        packaged_battery_weight_lb=packaged_battery_weight_lb,
        dry_aircraft_weight_allowance_lb=dry_aircraft_weight_allowance_lb,
        route_duration_min=route_duration_hr * 60,
        mission_energy_wh=mission_energy_wh,
        mission_energy_margin_wh=mission_energy_margin_wh,
        mission_margin_fraction=mission_margin_fraction,
        modeled_max_range_mi=modeled_max_range_mi,
    )


def report() -> str:
    """Produce a reproducible human-readable screening summary."""
    result = evaluate()
    values: dict[str, Any] = asdict(result)
    ordered = [
        ("Rotor disk area", "rotor_disk_area_m2", "m²"),
        ("Ideal hover power", "ideal_hover_power_kw", "kW"),
        ("Estimated hover power", "estimated_hover_power_kw", "kW"),
        ("Estimated cruise power", "estimated_cruise_power_kw", "kW"),
        ("Nominal pack energy", "nominal_pack_energy_wh", "Wh"),
        ("Dispatch energy", "dispatch_energy_wh", "Wh"),
        ("Bare cells", "bare_cells_weight_lb", "lb"),
        ("Packaged battery", "packaged_battery_weight_lb", "lb"),
        ("Dry-aircraft allowance", "dry_aircraft_weight_allowance_lb", "lb"),
        ("10-mile route duration", "route_duration_min", "min"),
        ("10-mile mission energy", "mission_energy_wh", "Wh"),
        ("Mission energy margin", "mission_energy_margin_wh", "Wh"),
        ("Mission margin", "mission_margin_fraction", "%"),
        ("Modeled maximum range", "modeled_max_range_mi", "mi"),
    ]
    lines = []
    for label, key, unit in ordered:
        value = values[key]
        if key == "mission_margin_fraction":
            value *= 100
        lines.append(f"{label:26} {value:8.2f} {unit}")
    return "\n".join(lines)


if __name__ == "__main__":
    print(report())
