# ORKA Product UI System

The authenticated product uses a restrained, high-trust workspace language. Marketing pages keep their expressive ORKA palette and display typography; product pages use the system below.

## Foundations

- Shell: `#030914` with `#06101f` structural navigation.
- Panels: `#0a1c2e` with a 1px `border` token and restrained shadow.
- Primary: violet `#9474ff`, used for selected navigation and primary actions.
- Semantic colors: teal for success, orange for pending, coral for danger, blue for information.
- Product type: DM Sans/system UI. Anton is reserved for marketing display moments.
- Control radius: 8px. Card radius: 12px. Panel radius: 16px.

## Interaction

- Press feedback starts on pointer down at `scale(0.97)`.
- Frequent UI transitions stay between 120ms and 250ms.
- Motion uses transform and opacity where possible, with the shared ease-out curve.
- Hover styling is only meaningful for pointer-capable devices.
- Reduced motion removes positional movement while retaining state/color feedback.

## Composition

Authenticated screens use `AppShell`, `PageHeader`, `Card`/`Panel`, `MetricCard`, `StatusPill`, and the shared product primitives. New screens should use semantic tokens instead of one-off hex values or custom radii.
