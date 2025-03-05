"use client;";

import * as Controls from "./controls";
import { Circle } from "fabric";

export type CircleControlsProps = {
  properties: Partial<Circle>;
  handleValueChange: (key: keyof Circle) => (value: unknown) => void;
};

function CircleControls({ handleValueChange, properties }: CircleControlsProps) {
  return (
    <Controls.ControlGroup title="Cirle">
      <Controls.ControlGrid>
        <Controls.ControlInput
          label="Radius"
          max={500}
          value={properties.radius ?? 0}
          onChange={handleValueChange("radius")}
          withSlider
          unit="px"
        />
      </Controls.ControlGrid>
    </Controls.ControlGroup>
  );
}

export default CircleControls;
