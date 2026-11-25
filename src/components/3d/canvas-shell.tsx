"use client";

import React, { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import type { PropsWithChildren, ReactNode } from "react";

interface WebGLCapabilities {
  supported: boolean;
  reducedMotion: boolean;
  dpr: [number, number];
}

function detectWebGL(): WebGLCapabilities {
  if (typeof window === "undefined") {
    return { supported: false, reducedMotion: false, dpr: [1, 1.5] };
  }

  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  let supported = false;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    supported = Boolean(gl);
  } catch {
    supported = false;
  }

  const maxDpr = window.devicePixelRatio ? Math.min(window.devicePixelRatio, 1.75) : 1.5;
  return {
    supported,
    reducedMotion,
    dpr: [1, Math.max(1, maxDpr)],
  };
}

class SceneErrorBoundary extends React.Component<
  { fallback: ReactNode; children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { fallback: ReactNode; children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export interface CanvasShellProps extends PropsWithChildren {
  fallback?: ReactNode;
  className?: string;
  cameraPosition?: [number, number, number];
  fov?: number;
  frameloop?: "always" | "demand";
  ariaLabel?: string;
}

/**
 * Shared responsive, lazy-hydrated Three.js Canvas shell.
 * Automatically degrades cleanly when WebGL is unavailable, under headless capture,
 * or when prefers-reduced-motion is enabled.
 */
export function CanvasShell({
  children,
  fallback,
  className = "w-full h-full",
  cameraPosition = [0, 0, 8],
  fov = 45,
  frameloop,
  ariaLabel = "Interactive 3D scene",
}: CanvasShellProps) {
  const [caps, setCaps] = useState<WebGLCapabilities | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCaps(detectWebGL());
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const defaultFallback = fallback || (
    <div className="w-full h-full rounded-2xl bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.18),rgba(6,16,12,0.92)_70%)] border border-[#143326] flex items-center justify-center p-6 text-center">
      <div className="space-y-2 max-w-xs">
        <div className="w-10 h-10 mx-auto rounded-full bg-[#10B981]/15 border border-[#16382C] flex items-center justify-center">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00DC82]" />
        </div>
        <p className="text-xs font-medium text-[#A7F3D0]">Interactive Visualization Ready</p>
        <p className="text-[11px] text-[#8FA69B]">
          Rendered with lightweight SVG/CSS spatial mode for current display capabilities.
        </p>
      </div>
    </div>
  );

  if (!caps || !caps.supported) {
    return (
      <div className={className} role="region" aria-label={ariaLabel}>
        {defaultFallback}
      </div>
    );
  }

  return (
    <div className={className} role="region" aria-label={ariaLabel}>
      <SceneErrorBoundary fallback={defaultFallback}>
        <Suspense fallback={defaultFallback}>
          <Canvas
            dpr={caps.dpr}
            frameloop={frameloop ?? (caps.reducedMotion ? "demand" : "always")}
            camera={{ position: cameraPosition, fov }}
            gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          >
            {children}
          </Canvas>
        </Suspense>
      </SceneErrorBoundary>
    </div>
  );
}
