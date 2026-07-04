interface IllustrationSlotProps {
  children: React.ReactNode;
}

/** Width wrapper. Grid column supplies sizing; frame chrome lives in SectionIllustration. */
export function IllustrationSlot({ children }: IllustrationSlotProps) {
  return <div className="illustration-slot">{children}</div>;
}