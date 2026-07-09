const signals = [
  "Reveal Index™",
  "Blueprint™",
  "Action Queue™",
  "Partner API",
  "MCP / A2MCP",
];

export function SocialProof() {
  return (
    <section className="border-y border-border bg-surface/70">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-6 py-8 md:flex-row md:justify-between md:gap-8">
        <p className="text-center text-sm font-medium text-muted md:text-left">
          Trusted by founders building the next generation of software.
        </p>
        <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 md:justify-end">
          {signals.map((label) => (
            <li
              key={label}
              className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-muted/90"
            >
              {label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
