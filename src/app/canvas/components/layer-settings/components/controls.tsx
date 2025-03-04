"use client;";

import { ComponentProps, ComponentType, ReactNode, SVGProps } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  // unit?: string; // TODO
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
  // unit,
  ...rest
}: ControlInputProps) {
  return (
    <ControlLabel {...rest}>
      <div className="flex items-center gap-2">
        <Input
          value={value}
          type="number"
          className="w-16"
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(Number(e.target.value.trim()))}
          customSize="sm"
          variant="secondary"
          disabled={disabled}
        />
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
} & ControlLabelProps;

export function ControlColor({ value, onChange, disabled, ...rest }: ControlColorProps) {
  return (
    <ControlLabel {...rest}>
      <input
        type="color"
        className="block w-8 h-8 rounded-full border-[6px] border-muted"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
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
