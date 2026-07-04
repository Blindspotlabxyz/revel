interface IllustrationSlotProps {
  children: React.ReactNode;
}

/** Width wrapper — grid column supplies sizing; frame chrome lives in SectionIllustration. */
export function IllustrationSlot({ children }: IllustrationSlotProps) {
  return <div className="illustration-slot">{children}</div>;
}