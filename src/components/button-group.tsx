"use client";

import * as React from "react";

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { VariantProps } from "class-variance-authority";

import { cn } from "../lib/utils";
import { toggleVariants } from "./ui/toggle";

const ButtonGroupContext = React.createContext<VariantProps<typeof toggleVariants>>({
  size: "default",
  variant: "default",
});

const ButtonGroup = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> &
    VariantProps<typeof toggleVariants>
>(({ className, variant, size, children, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root className={cn("flex", className)} {...props} ref={ref}>
      <ButtonGroupContext.Provider value={{ variant, size }}>
        {children}
      </ButtonGroupContext.Provider>
    </RadioGroupPrimitive.Root>
  );
});
ButtonGroup.displayName = RadioGroupPrimitive.Root.displayName;

const ButtonGroupItem = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Item>,
  {
    // custom props
  } & React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> &
    VariantProps<typeof toggleVariants>
>(({ className, children, variant, size, ...props }, ref) => {
  const context = React.useContext(ButtonGroupContext);

  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground",
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.RadioGroupIndicator className="absolute"></RadioGroupPrimitive.RadioGroupIndicator>
      {children}
    </RadioGroupPrimitive.Item>
  );
});
ButtonGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { ButtonGroup, ButtonGroupItem };
