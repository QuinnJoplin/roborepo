# Workspace operating model

## Purpose

Use this repository to turn concepts into traceable prototype decisions. Every design claim must be labeled as one of:

- **Requirement** — a binding target or regulatory constraint.
- **Assumption** — used by a model but not yet measured.
- **Measured result** — tied to a dated test record, instrument, and configuration.
- **Decision** — an approved choice with rationale.

## Design workflow

1. Capture the mission and legal operating assumptions.
2. Build a mass-and-energy budget with explicit reserve policy.
3. Select components only after the budget allocates their allowed mass and power.
4. Bench-test propulsion, battery, containment, control, and thermal behavior.
5. Update the model from measured data before expanding flight envelope.
6. Keep flight test logs, configuration IDs, and post-flight defects in `docs/`.

## EPM-20 evidence to collect next

- Motor/propeller thrust and electrical-power curves at the candidate voltage.
- Complete weighed mass breakdown, including fasteners, wiring, landing gear, battery enclosure, and payload restraint.
- Battery BMS, fusing, contactor/precharge, connector, mechanical retention, temperature sensing, and charge procedure.
- Airframe structural loads, vibration, center-of-gravity envelope, rotor-out behavior, and emergency landing behavior.
- Measured hover and forward-flight power at 54 lb takeoff mass in still air and representative temperature.

## Rule for scope changes

Do not quietly trade away payload, range, reserve, or the 54 lb design target. Record a decision in `docs/` whenever an assumption changes.
