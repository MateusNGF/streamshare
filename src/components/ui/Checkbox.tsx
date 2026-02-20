import * as React from "react"
import * as CheckboxPrimitives from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
    React.ElementRef<typeof CheckboxPrimitives.Root>,
    React.ComponentPropsWithoutRef<typeof CheckboxPrimitives.Root>
>(({ className, ...props }, ref) => (
    <CheckboxPrimitives.Root
        ref={ref}
        className={cn(
            "peer h-5 w-5 shrink-0 rounded-md border-2 border-gray-300 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all duration-200",
            className
        )}
        {...props}
    >
        <CheckboxPrimitives.Indicator
            className={cn("flex items-center justify-center text-white")}
        >
            <Check className="h-3.5 w-3.5 stroke-[4]" />
        </CheckboxPrimitives.Indicator>
    </CheckboxPrimitives.Root>
))
Checkbox.displayName = CheckboxPrimitives.Root.displayName

export { Checkbox }
