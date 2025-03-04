"use client;";

import { Textarea } from "@/components/ui/textarea";
import * as Controls from "./controls";
import { Textbox } from "fabric";
import { Toggle } from "@/components/ui/toggle";
import { ItalicIcon, StrikethroughIcon, UnderlineIcon } from "lucide-react";

export type TextBoxControlsProps = {
  properties: Partial<Textbox>;
  handleValueChange: (key: keyof Textbox) => (value: unknown) => void;
};

function TextBoxControls({ handleValueChange, properties }: TextBoxControlsProps) {
  return (
    <Controls.ControlGroup title="Text">
      <Controls.ControlGrid>
        <div className="col-span-full space-y-2">
          <Textarea
            variant="secondary"
            value={properties.text}
            onChange={(e) => handleValueChange("text")(e.target.value)}
          />
          <div className="flex gap-1 justify-end items-center">
            <Toggle
              pressed={properties.linethrough}
              onPressedChange={handleValueChange("linethrough")}
              size="sm"
              variant="outline"
            >
              <StrikethroughIcon size="12" />
            </Toggle>
            <Toggle
              pressed={properties.fontStyle === "italic"}
              onPressedChange={(value) =>
                handleValueChange("fontStyle")(value ? "italic" : "normal")
              }
              size="sm"
              variant="outline"
            >
              <ItalicIcon size="12" />
            </Toggle>
            <Toggle
              pressed={properties.underline}
              onPressedChange={handleValueChange("underline")}
              size="sm"
              variant="outline"
            >
              <UnderlineIcon size="12" />
            </Toggle>
          </div>
        </div>
        <Controls.ControlColor
          label="Color"
          value={properties.fill?.toString() ?? "#000000"}
          onChange={handleValueChange("fill")}
          withAlpha
        />
        <Controls.ControlColor
          label="Background"
          value={properties.backgroundColor?.toString() ?? "#000000"}
          onChange={handleValueChange("backgroundColor")}
          withAlpha
        />
        <Controls.ControlSelect
          label="Font"
          options={[
            { value: "Arial", label: "Arial" },
            { value: "Times New Roman", label: "Times New Roman" },
            { value: "Courier New", label: "Courier New" },
            { value: "monospace", label: "monospace" },
          ]}
          value={properties.fontFamily ?? ""}
          onChange={handleValueChange("fontFamily")}
        />
        <Controls.ControlSelect
          label="Alignment"
          options={[
            { value: "left", label: "Left" },
            { value: "center", label: "Center" },
            { value: "right", label: "Right" },
          ]}
          value={properties.textAlign ?? ""}
          onChange={handleValueChange("textAlign")}
        />
        <Controls.ControlSelect
          label="Weight"
          options={[
            { value: "100", label: "100 Hairline" },
            { value: "200", label: "200 Ultra Light" },
            { value: "300", label: "300 Light" },
            { value: "400", label: "400 Regular" },
            { value: "normal", label: "Normal" },
            { value: "500", label: "500 Medium" },
            { value: "600", label: "600 Semi Bold" },
            { value: "700", label: "700 Bold" },
            { value: "800", label: "800 Extra Bold" },
            { value: "900", label: "900 Black" },
          ]}
          value={properties.fontWeight?.toString() ?? ""}
          onChange={handleValueChange("fontWeight")}
        />
        <Controls.ControlInput
          label="Font Size"
          max={100}
          value={properties.fontSize ?? 0}
          onChange={handleValueChange("fontSize")}
          withSlider
        />
        <Controls.ControlInput
          label="Spacing"
          max={1000}
          value={properties.charSpacing ?? 0}
          onChange={handleValueChange("charSpacing")}
          withSlider
        />
        <Controls.ControlInput
          label="Line Height"
          min={0.1}
          step={0.1}
          max={10}
          value={properties.lineHeight ?? 0}
          onChange={handleValueChange("lineHeight")}
          withSlider
        />
      </Controls.ControlGrid>
    </Controls.ControlGroup>
  );
}

export default TextBoxControls;
