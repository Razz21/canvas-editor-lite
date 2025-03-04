import * as React from "react";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputVariants = cva(
  "flex w-full rounded-md text-base transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
  {
    variants: {
      variant: {
        default: "border border-input shadow-sm bg-transparent",
        secondary: "bg-secondary shadow-sm",
        ghost: "border-0 bg-transparent",
      },
      customSize: {
        sm: "h-8 px-2 py-1 text-sm",
        default: "h-9 px-3 py-1",
        lg: "h-10 px-4 py-2 ",
      },
    },
    defaultVariants: {
      variant: "default",
      customSize: "default",
    },
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, customSize, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, customSize, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
