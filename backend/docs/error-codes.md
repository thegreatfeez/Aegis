# Aegis Backend — Error Code Taxonomy

All error responses have the shape:
```json
{ "error": "<message>", "code": "<CODE>", "retryable": <boolean> }
```

| Code | HTTP | Retryable | Description |
|---|---|---|---|
| `VALIDATION_ERROR` | 400 | false | Request body or query param failed schema validation. Fix the request. |
| `NOT_FOUND` | 404 | false | The requested endpoint does not exist. |
| `UPSTREAM_ERROR` | 502 | true | A third-party service (Groq, ElevenLabs, Mantle RPC) returned an error or timed out. Safe to retry after a short backoff. |
| `NOT_CONFIGURED` | 503 | false | A required API key is missing from the server environment (e.g. `ELEVENLABS_API_KEY`). Contact backend operator. |
| `INTERNAL_ERROR` | 500 | false | Unexpected server-side error. Check server logs. |

## Retry guidance

For `UPSTREAM_ERROR`: use exponential backoff starting at 500 ms, max 3 retries.  
For all others: do not retry automatically — fix the root cause first.

## Frontend integration contract

The frontend must handle these codes without crashing:
- `VALIDATION_ERROR` → show a user-facing validation message
- `UPSTREAM_ERROR` → show "AI service temporarily unavailable, retrying…" and retry with backoff
- `NOT_CONFIGURED` → show "Voice briefing not available in this deployment"
- `INTERNAL_ERROR` → show generic error toast and log to console
