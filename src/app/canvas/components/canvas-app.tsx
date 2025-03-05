"use client;";

import NavTools from "./nav-tools";
import CanvasBase from "./canvas-base";
import CanvasSettings from "./canvas-settings";
import Layers from "./layers";
import LayerSettings from "./layer-settings";
// import CroppingSettings from "./cropping-settings";
import { ThemeToggle } from "@/app/components/theme-toggle";
import CanvasZoom from "./canvas-zoom";
import CanvasContextMenu from "./canvas-context-menu";

export type CanvasAppProps = {};

function CanvasApp({}: CanvasAppProps) {
  return (
    <div>
      <div className="z-10 relative">
        <NavTools />
        <Layers />
        <LayerSettings />
        <CanvasZoom />
        <div className="fixed top-4 right-4 flex gap-2">
          <ThemeToggle />
          <CanvasSettings />
        </div>
      </div>
      <CanvasContextMenu>
        <CanvasBase />
      </CanvasContextMenu>
    </div>
  );
}

export default CanvasApp;
