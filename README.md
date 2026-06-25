# Time Timer Electron App

A personal macOS timer inspired by the physical Time Timer: drag the red disk to set up to 60 minutes, start it, and let it keep counting while you work in other apps.

## Features

- 60-minute analog countdown dial with five-minute labels and minute ticks.
- Wall-clock countdown logic, so elapsed time stays accurate if renderer callbacks are delayed.
- Electron renderer background throttling disabled for the timer window.
- Apple Silicon package script for local macOS builds.
- Ad-hoc signing for the packaged `.app`, suitable for local personal use.
- Custom disk color and completion sound.

## Development

```bash
npm install
npm start
```

This repo targets Electron 41 for current Apple Silicon macOS. If `npm start` aborts immediately with the old installed Electron 27 runtime, refresh dependencies first:

```bash
npm install
```

## Package For This Mac

```bash
npm run package
open release-builds/TimeTimer-darwin-arm64/TimeTimer.app
```
