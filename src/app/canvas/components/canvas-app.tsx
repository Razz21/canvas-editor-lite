'use client;';

import AddObjects from './add-objects';
import CanvasBase from './canvas-base';
import CanvasSettings from './canvas-settings';
import FloatingPanel from './floating-panel';
import Layers from './layers';
import LayerSettings from './layer-settings';
import CroppingSettings from './cropping-settings';

export type CanvasAppProps = {};

function CanvasApp({}: CanvasAppProps) {
  return (
    <div>
      <div className="z-20 relative">
        <FloatingPanel className="fixed top-1/2 -translate-y-1/2 left-4">
          <AddObjects />
        </FloatingPanel>
        <div className="fixed top-1/2 -translate-y-1/2 right-4 flex flex-col gap-4">
          <LayerSettings />
          <CanvasSettings />
          <CroppingSettings  />
          <Layers />
        </div>
      </div>
      <CanvasBase />
    </div>
  );
}

export default CanvasApp;
