"use client";

import * as React from "react";

export interface SwitchProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className: _className, label, ...props }, ref) => {
    return (
      <label className="inline-flex min-h-11 cursor-pointer items-center gap-2.5">
        <span className="relative inline-flex">
          <input
            type="checkbox"
            role="switch"
            className="peer sr-only"
            ref={ref}
            {...props}
          />
          <span
            aria-hidden="true"
            className="bg-border-strong peer-checked:bg-primary peer-focus-visible:outline-focus block h-6 w-11 rounded-full transition-colors duration-(--animate-duration-fast) peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-disabled:opacity-50 peer-checked:[&>span]:translate-x-5"
          >
            <span className="bg-elevated block size-5 translate-x-0.5 translate-y-0.5 rounded-full shadow-sm transition-transform duration-(--animate-duration-fast) ease-(--ease-rise)" />
          </span>
        </span>
        {label && <span className="text-fg text-sm font-medium">{label}</span>}
      </label>
    );
  }
);
Switch.displayName = "Switch";

export { Switch };
