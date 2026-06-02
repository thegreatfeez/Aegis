# Aegis Backend — API Versioning Policy

## Current version: 1.0.0

## Compatibility guarantees

- Response fields will never be removed without a major version bump.
- New optional response fields may be added at any minor version; consumers must tolerate unknown fields.
- Request schema validation is strict — extra fields are silently ignored, missing required fields return `VALIDATION_ERROR`.

## Backward-compatible changes (no version bump required)

- Adding new optional response fields
- Adding new optional request fields with documented defaults
- Adding new endpoints
- Changing `source` field values (these are informational, not machine-parsed)

## Breaking changes (require major version bump)

- Removing or renaming a required request or response field
- Changing a field's type
- Changing an enum's valid values (e.g. adding a new `signal` value counts as a minor change; removing one is breaking)
- Changing error code taxonomy

## Integration checklist for Halimah (frontend)

When the backend publishes a new version:
1. Check this file for breaking changes before upgrading.
2. Update `VITE_API_BASE_URL` if the base URL changes.
3. The `recommendation` response shape is the canonical AI output contract — treat changes to it as breaking.
4. `context.*` fields are supplemental; tolerate unknown keys.

## Commitment hash alignment (for Afeez)

The `context` block returned by `POST /api/groq-proxy` maps 1:1 to the fields required for `contextHash` in `AdviceCommitment.record()`:

```
context.yieldRates.usdy    → yield_rates.usdy
context.yieldRates.meth    → yield_rates.meth
context.nansenModifier     → (internal to riskScore computation)
context.elfaSentimentUsdy  → elfa_sentiment.usdy
context.elfaSentimentMeth  → elfa_sentiment.meth
```

The canonical JSON string for `contextHash` is produced by `buildAdviceCommitmentPayloads()` in `src/lib/commitmentSchema.ts` (frontend). Schema version `1.1.0` is the current stable version.
