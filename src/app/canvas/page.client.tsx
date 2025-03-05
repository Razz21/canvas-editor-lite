"use client";

import CanvasApp from "./components/canvas-app";

export default function PageClient({}) {
  return (
    <div className="flex flex-col items-center justify-center canvas-page min-h-screen h-full">
      <CanvasApp />
    </div>
  );
}
