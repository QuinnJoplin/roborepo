# EPM-20 design console — browser QA report

**Date:** 2026-11-25  
**Target:** Local React console at `http://127.0.0.1:5173/`  
**Scope:** Navigation, action controls, editable mass input, keyboard focus, responsive layout, and console errors.

## Executive summary

Four issues were found: **two high**, **two medium**. No browser console errors were observed during page load or the exercised interactions.

| ID | Severity | Category | Finding |
|---|---|---|---|
| 1 | High | Functional / data integrity | Negative dry-vehicle mass is accepted and produces a false feasible result. |
| 2 | High | Visual / responsive | The layout creates horizontal overflow at a 360 px mobile viewport. |
| 3 | Medium | Functional / UX | Navigation buttons only update the section label; they do not navigate or filter the workspace. |
| 4 | Medium | Functional / UX | `Export review brief` is an active-looking control with no output or state change. |

## 1. Negative dry-vehicle mass is accepted

**Severity:** High  
**Category:** Functional / data integrity

### Steps to reproduce

1. Open the console.
2. Set **Dry vehicle (lb)** to `-1`.
3. Observe the calculated takeoff mass and design status.

### Expected

The console should reject negative mass, preserve the last valid value, or show an invalid-input state that blocks feasibility results.

### Actual

The value is accepted. The console reports a **36.18 lb** takeoff mass and **Feasible** status, even though a negative dry vehicle mass is physically impossible.

### Evidence

Browser interaction result: input `-1` → takeoff mass `36.18 lb` → status `Feasible`.

## 2. Mobile layout horizontally overflows

**Severity:** High  
**Category:** Visual / responsive

### Steps to reproduce

1. Open the console at a 360 × 800 viewport.
2. Inspect the page width and the Mass budget panel.

### Expected

The console should fit the viewport or keep any intentionally scrollable region locally contained and visibly scrollable.

### Actual

The document width is **450 px** in a **360 px** viewport, creating page-level horizontal overflow and clipping content. The navigation row is also wider than the viewport.

### Evidence

- Browser measurement: `scrollWidth: 450`, `clientWidth: 360`.
- Screenshot: `screenshots/mobile-horizontal-overflow.png`.

## 3. Navigation does not change the displayed workspace

**Severity:** Medium  
**Category:** Functional / UX

### Steps to reproduce

1. Click **Mass budget**, **Energy model**, or **Build package**.
2. Compare the visible workspace contents before and after the click.

### Expected

The selected item should navigate to the named design surface, filter the workspace, or otherwise make the selected section meaningfully active.

### Actual

Only the header eyebrow changes (for example, `Mass budget / Screening model`). Both the Mass budget and Energy trace panels remain visible, and no Build package surface exists.

## 4. Export review brief is inert

**Severity:** Medium  
**Category:** Functional / UX

### Steps to reproduce

1. Click **Export review brief**.
2. Observe downloads, page state, and status messaging.

### Expected

The console should download a generated review artifact or explicitly mark the capability as unavailable/coming soon.

### Actual

No download, URL change, modal, feedback, or generated artifact occurs.

## Testing notes

- Tested at desktop-like 764 × 429 and mobile 360 × 800 viewports.
- Verified keyboard focus reaches the editable mass input and that it has a visible focus outline.
- The overweight case works: setting dry vehicle mass to `18` changes takeoff mass to `55.18 lb` and status to `Mass over target`.
- No JavaScript console errors were observed.
- This report documents browser findings only; no product code was modified.
