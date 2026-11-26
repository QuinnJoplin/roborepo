# EPM-20 feasibility screen — 2026-11-25

## Decision

**Proceed to a controlled architecture/prototyping phase.** A 20 lb-payload, replaceable-battery multirotor can plausibly meet a **10-mile vehicle-performance** target while launching at **54 lb**, but it has little structural and aerodynamic slack. The next gate is a weighed component budget and measured propulsion power; do not procure a production configuration yet.

## Requirement interpretation

| Item | Screening interpretation |
|---|---:|
| Payload | 20.0 lb, included in takeoff mass |
| Regulatory mass ceiling | Less than 55 lb at takeoff, including aircraft, attached systems, payload, and cargo |
| Engineering mass target | 54.0 lb to preserve a 1 lb compliance margin |
| Range requirement | 10.0 total vehicle miles in calm-air screening mission, not 10-mile outbound-plus-return |
| Battery | Field-replaceable, mechanically retained 14S7P lithium-ion pack |
| Enclosure | Enclosed payload/electronics fuselage; not a fully ducted-rotor configuration |

The FAA says Part 107 applies to small UAS weighing less than 55 lb and permits property transport when the aircraft, attached systems, payload, and cargo are below that total at takeoff.[1][2] A 10-mile-capable aircraft is **not automatically lawful to operate ten miles away**: standard Part 107 operation requires the aircraft remain within sight, with a visual observer required to keep unaided sight when FPV is used.[1][2]

## Reference configuration and model

The repeatable model is `src/feasibility.py`. It intentionally uses transparent assumptions rather than vendor thrust claims.

### Mass budget

| Budget item | Weight | Status |
|---|---:|---|
| Takeoff design target | 54.00 lb | Requirement |
| Payload | 20.00 lb | Requirement |
| 14S7P P50B bare cells (98 × 71 g) | 15.34 lb | Sourced cell calculation |
| Battery packaging/BMS/interconnect allowance (12%) | 1.84 lb | Assumption |
| Pack total | 17.18 lb | Derived |
| Everything except payload and pack | **16.82 lb** | Hard allowance |

The P50B data sheet lists 18.0 Wh typical cell energy, 71 g maximum cell weight, 60 A continuous discharge current, and 260 Wh/kg gravimetric energy density.[4] This makes battery power capability plausible; it does not establish pack-level thermal, safety, or life performance.

### Energy model inputs

| Input | Value | Status |
|---|---:|---|
| Rotor layout | 8 × 22 in open rotors | Architecture assumption |
| Figure of merit | 0.68 | Screening assumption |
| Cruise speed | 30 mph | Requirement assumption |
| Forward-flight factor | 82% of hover power | Screening assumption |
| Enclosure cruise penalty | 0.25 kW | Screening assumption |
| Terminal hover | 4 minutes total | Screening assumption |
| Battery dispatch SOC | 80% of nominal energy | Reserve policy |
| Electrical efficiency | 90% | Screening assumption |

With 98 cells, nominal energy is 1,764 Wh. The model dispatches 1,270 Wh after the 80% state-of-charge policy and 90% electrical-efficiency factor. It calculates 2.52 kW hover, 2.32 kW cruise, a 24-minute 10-mile mission, 941 Wh mission energy, 329 Wh remaining margin (25.9% of dispatch energy), and a modeled maximum route range of 14.25 miles with the same 4-minute terminal-hover allowance.

## What makes this feasible—and what could break it

### Feasible only if all of these hold

- The dry aircraft (airframe, enclosure, propulsion, landing gear, avionics, wiring, guards, thermal management, and payload restraint) weighs **no more than 16.82 lb**.
- Measured electrical hover power at 54 lb is at or below approximately 2.5 kW and realistic 30 mph cruise is near 2.3 kW.
- The enclosure does not become a heavy ducted-rotor structure or impose materially more drag than the model’s 0.25 kW allowance.
- The 20 lb payload can sit inside the verified center-of-gravity envelope and remain restrained under expected loads.

### Likely failure modes

1. **Mass creep:** guards, weather sealing, thermal hardware, redundant propulsion, connectors, and fasteners consume the 16.82 lb dry-vehicle allowance quickly.
2. **Range-definition mismatch:** a 10-mile *out-and-back* route needs materially more energy than this 10-mile total-route screen.
3. **Enclosure penalty:** fully ducted fans/rotors or a broad high-drag body may erase the energy margin.
4. **Reserve policy:** cold weather, cell aging, climb, wind, and contingency reserve can require a larger margin than the screening policy.
5. **Operations:** Part 107 registration, Remote ID, pilot certification, airspace rules, and visual-line-of-sight requirements still apply. The FAA states that registered drones must comply with Remote ID; a retrofit broadcast module is an available compliance path but does not remove visual-line-of-sight limits.[3]

## Architecture recommendation

Start with an **open-rotor octocopter** having an integrated enclosed central payload/battery bay, replaceable slide-in pack with positive latching, and a separate lightweight rotor-protection strategy. Preserve large rotor disk area; do not begin with a fully ducted aircraft. Design to the 54 lb target, not the legal limit, and treat 16.82 lb as an absolute, routinely weighed dry-mass cap.

## Next acceptance test

Before CAD freeze or major component orders:

1. Create a bottom-up mass budget with a 10% contingency inside the 16.82 lb dry allowance.
2. Select at least two motor/propeller candidates whose published test curves provide more than 2:1 total thrust at 54 lb and whose efficiency is measured at the expected hover thrust per rotor.
3. Build one representative removable 14S7P pack with BMS, fuse, contactor/precharge, thermal sensing, enclosure, retention, and a weighing record.
4. Bench-test one propulsion station, then a restrained full-airframe power test.
5. Replace the screening assumptions in `src/feasibility.py` with measured values. Advance only if the 10-mile model retains at least a 25% dispatched-energy margin after applying the approved reserve policy.

## Sources

[1] https://www.faa.gov/newsroom/small-unmanned-aircraft-systems-uas-regulations-part-107
[2] https://www.faa.gov/faq/package-delivery-allowed-under-small-uas-rule-part-107
[3] https://www.faa.gov/uas/getting_started/remote_id
[4] https://www.molicel.com/wp-content/uploads/Product-Data-Sheet-of-INR-21700-P50B-80122.pdf
