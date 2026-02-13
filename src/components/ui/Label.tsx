import * as React from "react";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> { }

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
    ({ className = "", ...props }, ref) => {
        const baseStyles = "text-sm font-medium text-gray-700 mb-1 block";
        const combinedClassName = `${baseStyles} ${className}`.trim();

        return <label className={combinedClassName} ref={ref} {...props} />;
    }
);

Label.displayName = "Label";

export { Label };
