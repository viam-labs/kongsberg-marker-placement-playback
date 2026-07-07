# placement-playback

A web viewer for replaying marker-placement sensor data from Viam robots. Load a `readings.json` payload and scrub through time to see where markers were placed on a map, alongside synced camera frames and sonar heatmaps.

## What it does

- **Map view** — plots real and synthetic marker placements on an interactive map, with a time slider to step through the session.
- **Synced media** — shows the camera frame and sonar pings that match the current scrubber position.
- **Gallery view** — multi-track timeline across camera, sonar sensors, and marker events for a broader overview of the capture window.

The app expects a single JSON file with `readings`, `images`, and `sonarFrames` fields. Marker readings must include at least `latitude` and `longitude`; images and sonar frames are optional but enable the media panels.

## Getting data

This app does not fetch data from Viam itself. Use [synthetic-sonar-eval](https://github.com/viam-labs/synthetic-sonar-eval) to pull marker-placement readings, camera frames, and rendered sonar heatmaps for a robot part and write a `readings.json` file ready to load here.

See **[Marker playback data](https://github.com/viam-labs/synthetic-sonar-eval/blob/master/README.md#4-marker-playback-data)** in that repo for setup and the `make markers` command.

Example:

```bash
make setup
make markers PART_ID=<part-id> START=2026-07-05T00:00:00Z END=2026-07-06T00:00:00Z
```

The output file lives at `output/marker-playback/<part-id>/readings.json`. Drag it into the app, or use the file picker on the map page.

## Development

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

## Viam module

This repo is packaged as a Viam application module (`kongsberg:marker-placement-playback-app`). Run `make module` to produce `module.tar.gz` for upload.
