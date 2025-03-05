"use client;";

import { FabricObject } from "fabric";
import { RotateCcwIcon } from "lucide-react";

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
        unit="px"
      />
      <Controls.ControlInput
        className="flex col-span-[2/-1]"
        label="Width"
        value={properties.width ?? 0}
        onChange={handleValueChange("width")}
        unit="px"
      />
      <Controls.ControlInput
        className="flex col-span-[1/1]"
        label="Y"
        value={properties.top ?? 0}
        onChange={handleValueChange("top")}
        unit="px"
      />
      <Controls.ControlInput
        className="flex col-span-[2/-1]"
        label="Height"
        value={properties.height ?? 0}
        onChange={handleValueChange("height")}
        unit="px"
      />
      <Controls.ControlInput
        className="flex col-span-[1/1]"
        label={<RotateCcwIcon size="16" />}
        max={360}
        value={properties.angle ?? 0}
        onChange={handleAngleChange}
        unit="°"
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
        step={1}
        min={0}
        max={100}
        value={Math.round((properties.opacity ?? 0) * 100)}
        onChange={(value) => handleValueChange("opacity")(+(value / 100).toFixed(2))}
        withSlider
        unit="%"
      />
    </Controls.ControlGrid>
  );
}

export default PositionControls;
