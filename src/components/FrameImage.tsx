import { useState } from 'react';
import type { Detection } from '../types';

interface FrameImageProps {
  frame: { mimeType: string; dataBase64: string; detections?: Detection[] } | null;
  alt: string;
}

const BOX_COLOR = '#4ade80'; // green-400, readable against the black backgrounds used here

// Renders a frame image with its detection boxes drawn on top. Boxes are
// normalized [0,1] fractions of the *original* image (see internal/detector),
// so the overlay SVG uses the image's own natural size as its viewBox — that
// makes the SVG's own "meet" fit match the <img>'s object-contain fit exactly,
// including any letterboxing for non-square sources.
export function FrameImage({ frame, alt }: FrameImageProps) {
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);

  if (!frame) {
    return (
      <div className="flex aspect-square w-full items-center justify-center bg-black text-xs text-slate-600">
        no frame yet
      </div>
    );
  }

  const detections = frame.detections ?? [];

  return (
    <div className="relative aspect-square w-full bg-black">
      <img
        className="block h-full w-full object-contain"
        src={`data:${frame.mimeType};base64,${frame.dataBase64}`}
        alt={alt}
        onLoad={(e) => {
          const img = e.currentTarget;
          setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
        }}
      />
      {naturalSize && detections.length > 0 && (
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox={`0 0 ${naturalSize.w} ${naturalSize.h}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {detections.map((d, i) => {
            const x = d.x_min * naturalSize.w;
            const y = d.y_min * naturalSize.h;
            const w = (d.x_max - d.x_min) * naturalSize.w;
            const h = (d.y_max - d.y_min) * naturalSize.h;
            return (
              <g key={i}>
                <rect
                  x={x}
                  y={y}
                  width={w}
                  height={h}
                  fill="none"
                  stroke={BOX_COLOR}
                  strokeWidth={2}
                  vectorEffect="non-scaling-stroke"
                />
                <text
                  x={x}
                  y={Math.max(y - 4, 10)}
                  fill={BOX_COLOR}
                  fontSize={13}
                  stroke="black"
                  strokeWidth={3}
                  paintOrder="stroke"
                >
                  {`${d.class_name} ${(d.confidence * 100).toFixed(0)}%`}
                </text>
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}
