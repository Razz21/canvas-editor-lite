"use client;";

import NavTools from "./nav-tools";
import CanvasBase from "./canvas-base";
import CanvasSettings from "./canvas-settings";
import FloatingPanel from "./floating-panel";
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
      <div className="z-20 relative">
        <FloatingPanel className="fixed left-1/2 -translate-x-1/2 top-4">
          <NavTools />
        </FloatingPanel>
        <Layers />
        <LayerSettings />
        <div className="fixed bottom-20 right-4 flex flex-col gap-2">
          <FloatingPanel>
            <CanvasSettings />
          </FloatingPanel>
          {/* <CroppingSettings /> */}
        </div>
        <CanvasZoom />
        <div className="fixed top-4 right-4">
          <ThemeToggle />
        </div>
      </div>
      <CanvasContextMenu>
        <CanvasBase />
      </CanvasContextMenu>
    </div>
  );
}

export default CanvasApp;
