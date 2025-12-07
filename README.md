# Casanode UI

Single Page Application for configuring a casanode node.

## Installation

### Prerequisites

- Node 22 or higher
- NPM 10 or higher

### Development

Clone the repository

```bash
git clone https://github.com/sentinelgrowthdao/casanode-ui.git
```

Access the repository folder and navigate into the `app` folder

```bash
cd casanode-ui/app
```

Install the required packages

```bash
npm i
```

Install `ionic`

```bash
npm install -g @ionic/cli
```

Generate the build information file for the application using the following command:

```bash
npm run prebuild
```

Launch the application

```bash
ionic serve
```

## Quick Connect URL (/connect)

The application (web build / packaged UI) exposes a lightweight bootstrap route that lets you pre-fill the connection parameters without manually typing them. You can open a URL of the form:

```
/connect?ip=192.168.50.1&port=14045&key=TOKEN
```

### Parameters

| Query Key | Aliases | Required | Description                                                                      |
| --------- | ------- | -------- | -------------------------------------------------------------------------------- |
| `ip`      | `host`  | Yes      | IP address or hostname of the target node. Basic validation (`[A-Za-z0-9_.:-]`). |
| `port`    | `p`     | Yes      | API port (1–65535).                                                              |
| `key`     | `token` | No       | Optional pre‑shared authentication token used for the initial login.             |

### What happens internally

1. The `/connect` view validates the query parameters.
2. If valid, it stores `ip`, `port`, and (optionally) `key` in an in‑memory Pinia store (`ConnectionStore`) that is NOT persisted (data is lost on full reload).
3. It immediately performs a `router.replace({ name: 'Home' })` to go back to the Home screen.
4. When you press Start, the app first uses the in‑memory values. If those are absent (e.g. page was reloaded), it falls back to the last successful endpoint (`lastIp` / `lastPort`) persisted alongside the authentication token in the `AuthStore`.
5. After a successful login, the resolved endpoint (ip/port) is stored as the new persisted fallback for future sessions.

### Security & hygiene notes

- The token is treated like a password: only share a `/connect` link over a trusted channel / network.
- The token does NOT stay in the URL or history. The short‑lived connection parameters are not persisted, but the last successful endpoint (ip/port) is saved with the auth token so the app can reconnect without re-supplying `/connect`.
- If you mis-typed a value, just revisit `/connect` with corrected parameters (it overwrites the in‑memory values).
- For one‑time use tokens, consider revoking or rotating them after initial pairing.

## License

This project is licensed under the GPL v3 License - see the LICENSE file for details.
