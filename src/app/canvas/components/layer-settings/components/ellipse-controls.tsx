"use client;";

import { Ellipse } from "fabric";

import * as Controls from "./controls";

export type EllipseControlsProps = {
  properties: Partial<Ellipse>;
  handleValueChange: (key: keyof Ellipse) => (value: unknown) => void;
};

function EllipseControls({ handleValueChange, properties }: EllipseControlsProps) {
  return (
    <Controls.ControlGroup title="Ellipse">
      <Controls.ControlGrid>
        <Controls.ControlInput
          label="Radius X"
          max={500}
          value={properties.rx ?? 0}
          onChange={handleValueChange("rx")}
          withSlider
          unit="px"
        />
        <Controls.ControlInput
          label="Radius Y"
          max={500}
          value={properties.ry ?? 0}
          onChange={handleValueChange("ry")}
          withSlider
          unit="px"
        />
      </Controls.ControlGrid>
    </Controls.ControlGroup>
  );
}

export default EllipseControls;
