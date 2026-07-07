import type { Detection, ImageFrame, Reading, SonarFrame } from '../types';

export interface ParsedPlayback {
  readings: Reading[];
  images: ImageFrame[];
  sonarFrames: SonarFrame[];
}

function normalizeReadings(arr: unknown[]): Reading[] {
  const readings: Reading[] = [];
  arr.forEach((raw, i) => {
    if (!raw || typeof raw !== 'object') return;
    const r = raw as Record<string, unknown>;
    if (typeof r.latitude !== 'number' || typeof r.longitude !== 'number') return;
    readings.push({
      depth: typeof r.depth === 'number' ? r.depth : 0,
      is_synthetic: Boolean(r.is_synthetic),
      latitude: r.latitude,
      longitude: r.longitude,
      marker_id: typeof r.marker_id === 'string' ? r.marker_id : `reading-${i}`,
      ts: typeof r.ts === 'number' ? r.ts : i,
    });
  });
  return readings.sort((a, b) => a.ts - b.ts);
}

function normalizeDetections(raw: unknown): Detection[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const detections: Detection[] = [];
  raw.forEach((entry) => {
    if (!entry || typeof entry !== 'object') return;
    const d = entry as Record<string, unknown>;
    if (
      typeof d.class_name !== 'string' ||
      typeof d.confidence !== 'number' ||
      typeof d.x_min !== 'number' ||
      typeof d.y_min !== 'number' ||
      typeof d.x_max !== 'number' ||
      typeof d.y_max !== 'number'
    ) {
      return;
    }
    detections.push({
      class_name: d.class_name,
      confidence: d.confidence,
      x_min: d.x_min,
      y_min: d.y_min,
      x_max: d.x_max,
      y_max: d.y_max,
    });
  });
  return detections.length > 0 ? detections : undefined;
}

function normalizeImages(arr: unknown[]): ImageFrame[] {
  const images: ImageFrame[] = [];
  arr.forEach((raw) => {
    if (!raw || typeof raw !== 'object') return;
    const r = raw as Record<string, unknown>;
    if (typeof r.ts !== 'number' || typeof r.dataBase64 !== 'string') return;
    images.push({
      ts: r.ts,
      mimeType: typeof r.mimeType === 'string' ? r.mimeType : 'image/jpeg',
      dataBase64: r.dataBase64,
      detections: normalizeDetections(r.detections),
    });
  });
  return images.sort((a, b) => a.ts - b.ts);
}

function normalizeSonarFrames(arr: unknown[]): SonarFrame[] {
  const frames: SonarFrame[] = [];
  arr.forEach((raw) => {
    if (!raw || typeof raw !== 'object') return;
    const r = raw as Record<string, unknown>;
    if (typeof r.ts !== 'number' || typeof r.dataBase64 !== 'string') return;
    frames.push({
      sensorName: typeof r.sensorName === 'string' ? r.sensorName : 'sonar',
      ts: r.ts,
      mimeType: typeof r.mimeType === 'string' ? r.mimeType : 'image/png',
      dataBase64: r.dataBase64,
      detections: normalizeDetections(r.detections),
    });
  });
  return frames.sort((a, b) => a.ts - b.ts);
}

/**
 * Accepts a JSON array of readings, a JSON object with `readings` (and optional `images` /
 * `sonarFrames`) array fields, or NDJSON (one reading per line — images/sonar frames aren't
 * supported in that form).
 */
export function parsePlaybackFile(text: string): ParsedPlayback {
  try {
    const parsed: unknown = JSON.parse(text);
    if (Array.isArray(parsed)) return { readings: normalizeReadings(parsed), images: [], sonarFrames: [] };
    if (parsed && typeof parsed === 'object') {
      const obj = parsed as Record<string, unknown>;
      const readings = Array.isArray(obj.readings) ? normalizeReadings(obj.readings) : [];
      const images = Array.isArray(obj.images) ? normalizeImages(obj.images) : [];
      const sonarFrames = Array.isArray(obj.sonarFrames) ? normalizeSonarFrames(obj.sonarFrames) : [];
      return { readings, images, sonarFrames };
    }
  } catch {
    // not a single JSON document — fall through to NDJSON parsing
  }

  const rawReadings: unknown[] = [];
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      rawReadings.push(JSON.parse(trimmed));
    } catch {
      // skip malformed lines
    }
  }
  return { readings: normalizeReadings(rawReadings), images: [], sonarFrames: [] };
}
