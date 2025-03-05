"use client;";

import CanvasBase from "./canvas-base";
import CanvasContextMenu from "./canvas-context-menu";
import CanvasSettings from "./canvas-settings";
import CanvasZoom from "./canvas-zoom";
import LayerSettings from "./layer-settings";
import Layers from "./layers";
import NavTools from "./nav-tools";
import { ThemeToggle } from "@/app/components/theme-toggle";
import "../lib/fabric";

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
