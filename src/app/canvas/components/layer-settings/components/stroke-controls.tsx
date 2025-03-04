"use client;";

import * as Controls from "./controls";
import { FabricObject } from "fabric";

export type StrokeControlsProps = {
  properties: Partial<FabricObject>;
  handleValueChange: (key: keyof FabricObject) => (value: unknown) => void;
};

function StrokeControls({ handleValueChange, properties }: StrokeControlsProps) {
  return (
    <Controls.ControlGroup title="Stroke">
      <Controls.ControlGrid>
        <Controls.ControlColor
          label="Color"
          value={properties.stroke?.toString() ?? "#000000"}
          onChange={handleValueChange("stroke")}
          withAlpha
        />
        <Controls.ControlInput
          label="Width"
          max={500}
          value={properties.strokeWidth ?? 0}
          onChange={handleValueChange("strokeWidth")}
          withSlider
        />
        <Controls.ControlSelect
          label="Line Cap"
          options={[
            { value: "butt", label: "Butt" },
            { value: "round", label: "Round" },
            { value: "square", label: "Square" },
          ]}
          value={properties.strokeLineCap ?? "butt"}
          onChange={handleValueChange("strokeLineCap")}
        />
        <Controls.ControlSelect
          label="Line Join"
          options={[
            { value: "miter", label: "Miter" },
            { value: "bevel", label: "Bevel" },
            { value: "round", label: "Round" },
          ]}
          value={properties.strokeLineJoin ?? "miter"}
          onChange={handleValueChange("strokeLineJoin")}
        />
        <Controls.ControlSelect
          label="Style"
          options={[
            { value: "0", label: "Solid" },
            { value: "10,5", label: "Dashed" },
            { value: "2,5", label: "Dotted" },
          ]}
          value={properties.strokeDashArray?.join(",") ?? "0"}
          onChange={(value) => handleValueChange("strokeDashArray")(value.split(",").map(Number))}
        />
      </Controls.ControlGrid>
    </Controls.ControlGroup>
  );
}

export default StrokeControls;
