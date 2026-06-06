export default function Ticker() {
  const text =
    "OH NO STEP-PDF / I'M STUCK / CONVERT FREE / NO PAYWALLS / PDF TOOLS / ";
  const repeated = text.repeat(8);

  return (
    <div
      className="overflow-hidden border-y-2 border-accent bg-accent py-3"
      aria-hidden="true"
    >
      <div className="ticker-animate flex whitespace-nowrap">
        <span className="font-display text-lg tracking-widest text-black sm:text-xl">
          {repeated}
        </span>
        <span className="font-display text-lg tracking-widest text-black sm:text-xl">
          {repeated}
        </span>
      </div>
    </div>
  );
}
