# Local design console

A React/Vite prototype for reviewing the EPM-20 mass and energy gates before physical design work proceeds.

## Run locally

```bash
npm install
npm run dev
```

## Verify

```bash
npm test
npm run build
```

## Current interaction

Change **Dry vehicle (lb)** in the Mass budget panel. The console recalculates takeoff mass and changes the design status when the 54 lb engineering target is exceeded.

This is deliberately a local, read-only prototype for the current feasibility assumptions. It does not yet save scenarios, select components, import CAD, produce a BOM, or control hardware.
