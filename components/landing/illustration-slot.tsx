interface IllustrationSlotProps {
  children: React.ReactNode;
  className?: string;
}

/** Width wrapper. Grid column supplies sizing; frame chrome lives in SectionIllustration. */
export function IllustrationSlot({ children, className }: IllustrationSlotProps) {
  return (
    <div className={className ? `illustration-slot ${className}` : "illustration-slot"}>
      {children}
    </div>
  );
}