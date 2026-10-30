import type { ComponentPropsWithoutRef, ReactNode } from "react";

const control =
  "w-full min-h-12 rounded-md border border-line-strong bg-paper px-4 text-[16px] text-ink placeholder:text-ink-faint focus:border-sage focus:outline-none focus-visible:ring-0";

export function Input({ className = "", ...props }: ComponentPropsWithoutRef<"input">) {
  return <input className={`${control} ${className}`} {...props} />;
}

export function Textarea({ className = "", ...props }: ComponentPropsWithoutRef<"textarea">) {
  return <textarea className={`${control} min-h-24 py-3 leading-relaxed ${className}`} {...props} />;
}

export function Select({ className = "", ...props }: ComponentPropsWithoutRef<"select">) {
  return <select className={`${control} appearance-none pr-10 ${className}`} {...props} />;
}

export function Label({
  children,
  hint,
  className = "",
  ...props
}: ComponentPropsWithoutRef<"label"> & { hint?: ReactNode }) {
  return (
    <label className={`block text-[15px] font-medium text-ink ${className}`} {...props}>
      {children}
      {hint ? <span className="ml-2 font-normal text-ink-mute">{hint}</span> : null}
    </label>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  children,
  className = "",
}: {
  label: ReactNode;
  htmlFor: string;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={htmlFor} hint={hint}>
        {label}
      </Label>
      {children}
    </div>
  );
}
