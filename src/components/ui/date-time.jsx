import { DateField, DateInput, DateSegment } from "react-aria-components";

export default function DateTime({
  disabled,
  value,
  onChange,
  ariaLabelledby,
}) {
  return (
    <div className="space-y-2">
      <DateField
        disabled={disabled}
        granularity="minute"
        hourCycle={24}
        value={value}
        onChange={onChange}
        aria-labelledby={ariaLabelledby}
      >
        <DateInput className="relative inline-flex h-9 w-full items-center overflow-hidden whitespace-nowrap rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm shadow-black/[.04] ring-offset-background transition-shadow data-[focus-within]:border-ring data-[disabled]:opacity-50 data-[focus-within]:outline-none data-[focus-within]:ring-2 data-[focus-within]:ring-ring/30 data-[focus-within]:ring-offset-2">
          {(segment) => (
            <DateSegment
              segment={segment}
              className="inline rounded p-0.5 text-foreground caret-transparent outline outline-0 data-[disabled]:cursor-not-allowed data-[focused]:bg-accent data-[invalid]:data-[focused]:bg-destructive data-[type=literal]:px-0 data-[focused]:data-[placeholder]:text-foreground data-[focused]:text-foreground data-[invalid]:data-[focused]:data-[placeholder]:text-destructive-foreground data-[invalid]:data-[focused]:text-destructive-foreground data-[invalid]:data-[placeholder]:text-destructive data-[invalid]:text-destructive data-[placeholder]:text-muted-foreground/70 data-[type=literal]:text-muted-foreground/70 data-[disabled]:opacity-50"
            />
          )}
        </DateInput>
      </DateField>
    </div>
  );
}
