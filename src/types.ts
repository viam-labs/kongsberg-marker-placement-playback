export interface Reading {
  depth: number;
  is_synthetic: boolean;
  latitude: number;
  longitude: number;
  marker_id: string;
  ts: number;
}

export interface Detection {
  class_name: string;
  confidence: number;
  x_min: number;
  y_min: number;
  x_max: number;
  y_max: number;
}

export interface ImageFrame {
  ts: number;
  mimeType: string;
  dataBase64: string;
  detections?: Detection[];
}

export interface SonarFrame {
  sensorName: string;
  ts: number;
  mimeType: string;
  dataBase64: string;
  detections?: Detection[];
}

export interface TimelineTrack {
  label: string;
  moments: number[]; // this source's frame timestamps, ascending
  dotClassName: string;
}
