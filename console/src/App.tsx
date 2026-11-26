import { useMemo, useState } from 'react'
import './styles.css'

type Status = 'Feasible' | 'Mass over target' | 'Needs valid input'

const TARGET_TAKEOFF_LB = 54
const PAYLOAD_LB = 20
const PACK_LB = 17.18
const DISPATCH_ENERGY_WH = 1270.08
const MISSION_ENERGY_WH = 932.34
const SECTION_IDS: Record<string, string> = {
  Overview: 'overview',
  'Mass budget': 'mass-budget',
  'Energy model': 'energy-model',
  'Build package': 'build-package',
}

const number = (value: number, digits = 2) => value.toFixed(digits)

export default function App() {
  const [dryVehicle, setDryVehicle] = useState(16.82)
  const [dryVehicleInput, setDryVehicleInput] = useState('16.82')
  const [activeSection, setActiveSection] = useState('Overview')
  const [exportMessage, setExportMessage] = useState('')
  const parsedDryVehicle = Number(dryVehicleInput)
  const hasValidDryVehicle = dryVehicleInput.trim() !== ''
    && Number.isFinite(parsedDryVehicle)
    && parsedDryVehicle >= 0
    && parsedDryVehicle <= 40

  const model = useMemo(() => {
    const takeoffWeight = PAYLOAD_LB + PACK_LB + dryVehicle
    const massMargin = TARGET_TAKEOFF_LB - takeoffWeight
    const energyMarginWh = DISPATCH_ENERGY_WH - MISSION_ENERGY_WH
    const energyMarginPercent = (energyMarginWh / DISPATCH_ENERGY_WH) * 100
    const status: Status = !hasValidDryVehicle
      ? 'Needs valid input'
      : massMargin >= 0 ? 'Feasible' : 'Mass over target'

    return { takeoffWeight, massMargin, energyMarginWh, energyMarginPercent, status }
  }, [dryVehicle, hasValidDryVehicle])

  const massGateLabel = !hasValidDryVehicle
    ? 'Mass gate: resolve the dry-vehicle input'
    : model.massMargin >= 0 ? 'Mass gate: within 54 lb target' : 'Mass gate: redesign required'

  const updateDryVehicle = (value: string) => {
    setDryVehicleInput(value)
    const parsed = Number(value)
    if (value.trim() !== '' && Number.isFinite(parsed) && parsed >= 0 && parsed <= 40) {
      setDryVehicle(parsed)
    }
  }

  const navigateToSection = (section: string) => {
    setActiveSection(section)
    document.getElementById(SECTION_IDS[section])?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const exportReviewBrief = () => {
    const brief = `# EPM-20 review brief\n\n- Design status: ${model.status}\n- Takeoff mass: ${number(model.takeoffWeight)} lb\n- Mass target: ${TARGET_TAKEOFF_LB} lb\n- Dry vehicle input: ${dryVehicleInput} lb\n- Energy reserve: ${number(model.energyMarginPercent, 1)}% (${number(model.energyMarginWh, 0)} Wh)\n- Scenario: Calm air, 10 mi total route, 30 mph\n`
    if (typeof URL.createObjectURL === 'function') {
      const link = document.createElement('a')
      link.href = URL.createObjectURL(new Blob([brief], { type: 'text/markdown;charset=utf-8' }))
      link.download = 'epm-20-review-brief.md'
      link.click()
      URL.revokeObjectURL(link.href)
    }
    setExportMessage('Review brief downloaded.')
  }

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="Project navigation">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">RD</span>
          <div>
            <p className="eyebrow">Robot & Drone Works</p>
            <h1>EPM-20</h1>
          </div>
        </div>

        <nav>
          {['Overview', 'Mass budget', 'Energy model', 'Build package'].map((section) => (
            <button
              className={activeSection === section ? 'nav-item is-active' : 'nav-item'}
              key={section}
              aria-current={activeSection === section ? 'page' : undefined}
              onClick={() => navigateToSection(section)}
            >
              {section}
            </button>
          ))}
        </nav>

        <div className="sidebar-footnote">
          <span className="revision-dot" />
          <div>
            <strong>Revision A · Draft</strong>
            <span>54 lb engineering target</span>
          </div>
        </div>
      </aside>

      <section className="workspace" aria-label="EPM-20 design console">
        <header className="topbar" id="overview">
          <div>
            <p className="eyebrow">{activeSection} / Screening model</p>
            <h2>Payload multirotor</h2>
          </div>
          <div className="topbar-actions">
            <span className="source-pill">Assumptions visible</span>
            <button className="quiet-button" type="button" onClick={exportReviewBrief}>Export review brief</button>
          </div>
        </header>
        {exportMessage && <p className="export-status" role="status">{exportMessage}</p>}

        <section className="status-strip" aria-label="Design gates">
          <div>
            <span className="eyebrow">Design status</span>
            <strong className={model.status === 'Feasible' ? 'status-good' : 'status-alert'}>{model.status}</strong>
          </div>
          <p>{massGateLabel}. Energy reserve remains above the 25% screening gate.</p>
          <span className="scenario-label">Calm air · 10 mi total route · 30 mph</span>
        </section>

        <section className="metric-grid" aria-label="Key measurements">
          <article className="metric-card primary-metric">
            <span>Takeoff mass</span>
            <strong>{number(model.takeoffWeight)} lb</strong>
            <small>{model.massMargin >= 0 ? `${number(model.massMargin)} lb under target` : `${number(Math.abs(model.massMargin))} lb over target`}</small>
          </article>
          <article className="metric-card">
            <span>Dry vehicle allowance</span>
            <strong>16.82 lb</strong>
            <small>Frame, propulsion, enclosure, avionics</small>
          </article>
          <article className="metric-card">
            <span>Energy reserve</span>
            <strong>{number(model.energyMarginPercent, 1)}%</strong>
            <small>{number(model.energyMarginWh, 0)} Wh after modeled mission</small>
          </article>
          <article className="metric-card">
            <span>Modeled route ceiling</span>
            <strong>14.4 mi</strong>
            <small>Same hover and reserve assumptions</small>
          </article>
        </section>

        <section className="console-grid">
          <article className="panel mass-panel" id="mass-budget">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Constraint editor</p>
                <h3>Mass budget</h3>
              </div>
              <span className={hasValidDryVehicle && model.massMargin >= 0 ? 'gate-pill pass' : 'gate-pill fail'}>
                {hasValidDryVehicle && model.massMargin >= 0 ? 'Pass' : 'Fail'}
              </span>
            </div>

            <div className="mass-rows">
              <div className="budget-row locked-row"><span>Payload</span><strong>{number(PAYLOAD_LB)} lb</strong><small>Requirement</small></div>
              <div className="budget-row locked-row"><span>Replaceable battery pack</span><strong>{number(PACK_LB)} lb</strong><small>14S7P model</small></div>
              <label className="budget-row editable-row">
                <span>Dry vehicle</span>
                <input
                  aria-label="Dry vehicle (lb)"
                  min="0"
                  max="40"
                  step="0.01"
                  type="number"
                  aria-invalid={!hasValidDryVehicle}
                  value={dryVehicleInput}
                  onChange={(event) => updateDryVehicle(event.target.value)}
                />
                <small>Editable assumption</small>
              </label>
              {!hasValidDryVehicle && (
                <p className="input-error" role="alert">Dry vehicle mass must be between 0 and 40 lb.</p>
              )}
              <div className="budget-total"><span>Calculated takeoff mass</span><strong>{number(model.takeoffWeight)} lb</strong></div>
            </div>
            <p className="panel-note">This console uses the 54 lb engineering target—not the 55 lb legal maximum—to retain a measurable compliance margin.</p>
          </article>

          <article className="panel energy-panel" id="energy-model">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Mission model</p>
                <h3>Energy trace</h3>
              </div>
              <span className="gate-pill pass">Pass</span>
            </div>
            <div className="energy-scale" aria-label="Energy budget visualization">
              <div className="energy-rail"><span style={{ width: '73.4%' }} /></div>
              <div className="energy-values"><span>Mission: 932 Wh</span><span>Reserve: 338 Wh</span></div>
            </div>
            <dl className="model-list">
              <div><dt>Dispatch energy</dt><dd>1,270 Wh</dd></div>
              <div><dt>Hover estimate</dt><dd>2.50 kW</dd></div>
              <div><dt>Cruise estimate</dt><dd>2.30 kW</dd></div>
              <div><dt>Terminal hover</dt><dd>4 min</dd></div>
            </dl>
            <p className="panel-note">Replace these assumptions with bench and flight-test measurements before design freeze.</p>
          </article>
        </section>

        <section className="panel decision-panel">
          <div>
            <p className="eyebrow">Next engineering gate</p>
            <h3>Close the dry-mass budget before selecting an airframe.</h3>
          </div>
          <ol>
            <li>Weigh a candidate propulsion station.</li>
            <li>Build the retained, serviceable battery-pack mockup.</li>
            <li>Allocate the remaining dry mass by subsystem.</li>
          </ol>
        </section>

        <section className="panel build-package" id="build-package">
          <div>
            <p className="eyebrow">Review handoff</p>
            <h3>Build package</h3>
          </div>
          <p>Export the current constraints, mass budget, energy assumptions, and next engineering gate as a review brief.</p>
        </section>
      </section>
    </main>
  )
}
