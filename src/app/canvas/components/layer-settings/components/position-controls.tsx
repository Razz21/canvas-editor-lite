"use client;";

import { RotateCcwIcon } from "lucide-react";
import { FabricObject } from "fabric";

import * as Controls from "./controls";

export type PositionControlsProps = {
  properties: Partial<FabricObject>;
  handleValueChange: (key: keyof FabricObject) => (value: unknown) => void;
  handleAngleChange: (value: number) => void;
};

function PositionControls({
  handleValueChange,
  handleAngleChange,
  properties,
}: PositionControlsProps) {
  return (
    <Controls.ControlGrid>
      <Controls.ControlInput
        className="flex col-span-[1/1]"
        label="X"
        step={1}
        value={properties.left ?? 0}
        onChange={handleValueChange("left")}
      />
      <Controls.ControlInput
        className="flex col-span-[2/-1]"
        label="Width"
        value={properties.width ?? 0}
        onChange={handleValueChange("width")}
      />
      <Controls.ControlInput
        className="flex col-span-[1/1]"
        label="Y"
        value={properties.top ?? 0}
        onChange={handleValueChange("top")}
      />
      <Controls.ControlInput
        className="flex col-span-[2/-1]"
        label="Height"
        value={properties.height ?? 0}
        onChange={handleValueChange("height")}
      />
      <Controls.ControlInput
        className="flex col-span-[1/1]"
        label={<RotateCcwIcon size="16" />}
        max={360}
        value={properties.angle ?? 0}
        onChange={handleAngleChange}
      />
      <Controls.ControlSelect
        label="Blend"
        disabled
        options={[
          { value: "normal", label: "Normal" },
          { value: "multiply", label: "Multiply" },
        ]}
        value={"normal"}
        onChange={() => {}}
      />
      <Controls.ControlInput
        label="Opacity"
        step={0.01}
        min={0}
        max={1}
        value={properties.opacity ?? 0}
        onChange={handleValueChange("opacity")}
        withSlider
      />
    </Controls.ControlGrid>
  );
}

export default PositionControls;
