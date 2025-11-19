import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Circle } from "lucide-react";

import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-5 w-5 shrink-0 rounded-sm border-2 border-gray-300 bg-white data-[state=checked]:bg-white data-[state=checked]:border-[#083cb5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#083cb5] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className={cn("flex items-center justify-center")}>
      <Circle className="h-3 w-3 fill-[#083cb5] text-[#083cb5]" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
