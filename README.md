# Casanode App

Mobile application for installing and configuring a casanode node.

## Installation

### Prerequisites

- Node 22 or higher
- NPM 10 or higher
- Android Studio Koala (2024.1.1)

### Development

Clone the repository

```bash
git clone https://github.com/sentinelgrowthdao/casanode-mobile-app.git
```

Access the repository folder and navigate into the `app` folder

```bash
cd casanode-mobile-app/app
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


# Running on Android

To run the application on an Android device or emulator, follow these steps:

1. Build the Ionic project:

```bash
ionic build
```

2. Sync the Capacitor plugins and dependencies:

```bash
npx cap sync
```

3. Sync the web assets to the native Android project:

```bash
ionic capacitor copy android
````

4. Open the project in Android Studio:
```bash
ionic capacitor open android
```

5. Build and run the application in Android Studio:

- In Android Studio, click on `Build > Make Project` to ensure the project builds correctly.
- Select your target device (emulator or connected device).
- Click on the Run button (green play icon) to compile and launch the application on your selected device.

Ensure that you have the necessary Android SDK and tools installed in Android Studio to successfully build and run the project.

## Quick Connect URL (/connect)

The application (web build / packaged UI) exposes a lightweight bootstrap route that lets you pre-fill the connection parameters without manually typing them. You can open a URL of the form:

```
/connect?ip=192.168.50.1&port=14045&key=TOKEN
```

### Parameters
| Query Key | Aliases        | Required | Description |
|-----------|----------------|----------|-------------|
| `ip`      | `host`         | Yes      | IP address or hostname of the target node. Basic validation (`[A-Za-z0-9_.:-]`). |
| `port`    | `p`            | Yes      | API port (1–65535). |
| `key`     | `token`        | No       | Optional pre‑shared authentication token used for the initial login.

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
