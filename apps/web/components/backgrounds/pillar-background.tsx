"use client";

import LightPillar from "./light-pillar";

export function PillarBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      <LightPillar
        topColor="#10B981"
        bottomColor="#06d4bd"
        intensity={1.2}
        rotationSpeed={0.7}
        glowAmount={0.002}
        pillarWidth={4.8}
        pillarHeight={0.4}
        noiseIntensity={0.1}
        pillarRotation={25}
        interactive={false}
        mixBlendMode="screen"
        quality="high"
      />
    </div>
  );
}
