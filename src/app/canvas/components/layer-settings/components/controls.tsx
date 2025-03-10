"use client;";

import { ComponentProps, ComponentType, ReactNode, SVGProps, useEffect, useState } from "react";

import { Color } from "fabric";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

export type ControlLabelProps = { label: ReactNode } & Omit<ComponentProps<"div">, "onChange">;

export function ControlLabel({ label, children, className, ...rest }: ControlLabelProps) {
  return (
    <div
      className={cn(
        "grid grid-rows-subgrid grid-cols-subgrid col-span-full items-center justify-between",
        className
      )}
      {...rest}
    >
      <div className="text-sm text-muted-foreground truncate whitespace-nowrap">{label}</div>
      {children}
    </div>
  );
}

export type ControlInputProps = {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: ReactNode;
  onChange: (value: number) => void;
  withSlider?: boolean;
  disabled?: boolean;
} & ControlLabelProps;

export function ControlInput({
  value,
  max,
  min = 0,
  step = 1,
  onChange,
  withSlider,
  disabled,
  unit,
  ...rest
}: ControlInputProps) {
  return (
    <ControlLabel {...rest}>
      <div className="flex items-center gap-2">
        <div
          data-unit={unit}
          className="relative before:absolute before:my-auto before:content-[attr(data-unit)] before:right-2 before:text-muted-foreground before:text-xs before:pointer-events-none before:flex before:items-center before:h-full hover:before:hidden focus-within:before:hidden"
        >
          <Input
            value={value}
            type="number"
            className="w-16 "
            min={min}
            max={max}
            step={step}
            onChange={(e) => onChange(Number(e.target.value.trim()))}
            customSize="sm"
            variant="secondary"
            disabled={disabled}
          />
        </div>
        {withSlider ? (
          <Slider
            value={[value]}
            max={max}
            min={min}
            step={step}
            className="flex-1"
            size="sm"
            disabled={disabled}
            onValueChange={(values) => onChange(values[0])}
          />
        ) : null}
      </div>
    </ControlLabel>
  );
}

export type ControlColorProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  withAlpha?: boolean;
} & ControlLabelProps;

export function ControlColor({ value, onChange, withAlpha, disabled, ...rest }: ControlColorProps) {
  const [color, setColor] = useState({ hex: "#000000", alpha: 0 });

  useEffect(() => {
    if (!value) return;

    const fabricColor = new Color(value);
    setColor({
      hex: `#${fabricColor.toHex()}`,
      alpha: fabricColor.getAlpha() ?? 1,
    });
  }, [value]);

  const updateColor = (updates: Partial<typeof color>) => {
    const newState = { ...color, ...updates };
    setColor(newState);
    const rgbaColor = new Color(newState.hex).setAlpha(newState.alpha).toRgba();
    onChange(rgbaColor);
  };

  return (
    <ControlLabel {...rest}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          className="block w-8 h-8 rounded-full border-[6px] border-muted"
          value={color.hex}
          onChange={(e) => updateColor({ hex: e.target.value.trim() })}
          disabled={disabled}
        />
        {withAlpha ? (
          <Slider
            value={[color.alpha]}
            max={1}
            min={0}
            step={0.01}
            className="flex-1"
            size="sm"
            disabled={disabled}
            onValueChange={(values) => updateColor({ alpha: values[0] })}
          />
        ) : null}
      </div>
    </ControlLabel>
  );
}
export type ControlSelectOption = {
  value: string;
  label?: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
};

export type ControlSelectProps = {
  options: ControlSelectOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
} & ControlLabelProps;

export function ControlSelect({ value, options, onChange, disabled, ...rest }: ControlSelectProps) {
  return (
    <ControlLabel {...rest}>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="w-full" size="sm" variant="secondary">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((option) => (
              <SelectItem value={option.value} key={option.value}>
                {option.icon && <option.icon className="h-4 w-4" />} {option.label ?? option.value}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </ControlLabel>
  );
}

export type ControlGridProps = {} & ComponentProps<"div">;

export function ControlGrid({ children, className, ...rest }: ControlGridProps) {
  return (
    <div className={cn("grid grid-cols-[38%_1fr] gap-x-4 gap-y-2", className)} {...rest}>
      {children}
    </div>
  );
}

export type ControlGroupProps = { title?: ReactNode } & ComponentProps<"div">;

export function ControlGroup({ title, children, ...rest }: ControlGroupProps) {
  return (
    <div {...rest}>
      <h3 className="text-sm font-medium mb-2">{title}</h3>
      {children}
    </div>
  );
}
