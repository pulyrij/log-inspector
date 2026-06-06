# Logger — Documentation

A lightweight structured logging system with a real-time web viewer. Consists of a **server** that receives and stores logs, and a **client library** that sends them from any Node.js application.

---

## Architecture

```
Your App (LoggerClient)
    │  HTTP POST /logs
    ▼
Express Server (engine.js)
    │  WebSocket broadcast
    ▼
Browser (Log Inspector UI)
```

- **LoggerClient** — sends logs via HTTP from your application
- **Engine** — validates, transforms, stores logs; broadcasts to WebSocket subscribers
- **Log Inspector** — browser UI that connects via WebSocket and renders logs in real time

---

## Server

### Starting the server

```bash
node server.js
```

Runs on port `3000`. The Log Inspector UI is available at `http://<your-ip>:3000`.

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/logs` | Receive a log entry |
| `GET` | `/*` | Serve the static Log Inspector UI |

**POST /logs — request body:**

```json
{
  "sessionId": 123456789012,
  "logId": 1,
  "timestamp": 1718000000000,
  "pid": 1234,
  "hostname": "my-machine",
  "type": "alert",
  "service": "my-service",
  "module": "/src/index.js",
  "metadata": {
    "level": "info",
    "message": "Server started"
  }
}
```

**Responses:**

| Status | Body |
|--------|------|
| `200` | `{ ok: true }` |
| `400` | `{ ok: false, errors: [...] }` |

### WebSocket

Connect to `ws://<host>:3000/ws`.

On connection, the server replays the full log history, then streams new logs as they arrive.

**Message format:**
```json
{ "type": "LOG", "payload": { ...viewModel } }
```

---

## LoggerClient

### Installation

Copy `logger-client.js` into your project and import it.

### Setup

```js
import LoggerClient from './logger-client.js';

const logger = new LoggerClient('http://localhost:3000/logs', 'my-service');
```

**Constructor:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `url` | `string` | — | Full URL of the `/logs` endpoint |
| `service` | `string` | `''` | Service name shown in the UI |

Each instance gets a unique `sessionId` (random 12-digit number) so logs from different processes are distinguishable.

### Methods

#### `logger.info(message)`
General informational message.
```js
logger.info('Server started on port 3000');
```

#### `logger.warn(message)`
Warning — something unexpected but non-critical.
```js
logger.warn('Config file not found, using defaults');
```

#### `logger.event(message)`
Significant application event (user action, state change, etc.).
```js
logger.event('Trade offer accepted');
```

#### `logger.error(message, { error, severity })`
Error with attached exception and severity level.

```js
try {
  await fetchData();
} catch (err) {
  logger.error('Failed to fetch market data', {
    error: err,
    severity: 5
  });
}
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `message` | `string` | Human-readable description of what failed |
| `error` | `Error` | The caught exception |
| `severity` | `number` | Severity from 1 (low) to 10 (critical) |

### Severity scale

| Range | Meaning |
|-------|---------|
| 1–2 | Negligible — expected/recoverable errors |
| 3–4 | Minor — degraded functionality |
| 5–6 | Moderate — significant impact |
| 7–8 | High — partial system failure |
| 9–10 | Critical — system unusable |

---

## Log Types

### `alert`
Informational log with a level: `info`, `warn`, or `event`.

**Required metadata:** `message`  
**Optional metadata:** `level` (defaults to `info`)

### `error`
Log with an attached serialized error.

**Required metadata:** `error.name`, `error.message`  
**Optional metadata:** `message`, `severity` (defaults to `3`)

---

## Log Inspector UI

Open `http://<server-ip>:3000` in a browser.

- Connects automatically via WebSocket
- Replays history on reconnect
- Auto-scrolls when at the bottom
- Click a log header to expand the **meta** panel (timestamp, module, pid, hostname)
- Click the error name to expand **error details** (name, message, severity, stack summary)
- Click **stack** to expand the full **stack trace**

---

## Error Serialization

`serializeError(error)` converts an `Error` instance to a plain object safe for JSON transport. It preserves:

- `name`, `message`, `stack`
- `cause` (recursively serialized)
- Extra fields: `path`, `selector`, `event`, `reason`, `state`

On the server, `normalizeError()` further processes the serialized error:
- Cleans stack frames (strips `file:///`, makes paths relative to project root)
- Removes Node.js internal frames
- Truncates `cause` chains deeper than 3 levels

**Usage:**
```js
import { serializeError } from './logger-client.js';

logger.error('Something broke', {
  error: serializeError(someError), // or pass the Error directly
  severity: 6
});
```

Passing an `Error` directly to `logger.error` also works — serialization happens automatically inside the client.

---

## Module Detection

Each log automatically captures the **calling module path** (relative to project root), shown in the UI as the `module` field. No manual configuration needed.

---

## Notes

- Logs are stored **in memory** only — they are lost on server restart
- The server accepts connections from any host (`0.0.0.0`)
- If the WebSocket connection drops, the client retries every 10 seconds
- Failed HTTP log sends are silently swallowed (logged to `console` only) — the application is never blocked by logger failures