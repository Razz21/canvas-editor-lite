"use client;";

import NavTools from "./nav-tools";
import CanvasBase from "./canvas-base";
import CanvasSettings from "./canvas-settings";
import FloatingPanel from "./floating-panel";
import Layers from "./layers";
import LayerSettings from "./layer-settings";
import CroppingSettings from "./cropping-settings";
import { ThemeToggle } from "@/app/components/theme-toggle";

export type CanvasAppProps = {};

function CanvasApp({}: CanvasAppProps) {
  return (
    <div>
      <div className="z-20 relative">
        <FloatingPanel className="fixed left-1/2 -translate-x-1/2 top-4">
          <NavTools />
        </FloatingPanel>
        <FloatingPanel className="fixed left-4 top-1/2 -translate-y-1/2">
          <Layers />
        </FloatingPanel>
        <div className="fixed top-1/2 -translate-y-1/2 right-4 flex flex-col gap-2">
          <FloatingPanel>
            <LayerSettings />
          </FloatingPanel>

          <CanvasSettings />
          <CroppingSettings />
        </div>
      </div>
      <CanvasBase />
      <div className="fixed top-4 right-4">
        <ThemeToggle />
      </div>
    </div>
  );
}

export default CanvasApp;
