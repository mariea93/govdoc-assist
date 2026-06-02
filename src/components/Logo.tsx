import logoAsset from "@/assets/govlingua-logo.asset.json";

export function Logo({ className = "h-9 w-9", showText = true, textClassName = "" }: { className?: string; showText?: boolean; textClassName?: string }) {
  return (
    <div className="flex items-center gap-2">
      <img src={logoAsset.url} alt="GovLingua AI" className={`${className} rounded-md object-contain`} />
      {showText && (
        <span className={`font-display text-lg font-bold tracking-tight ${textClassName}`}>
          <span style={{ color: "var(--brand-blue)" }}>Gov</span>
          <span style={{ color: "var(--brand-green)" }}>Lingua</span>{" "}
          <span style={{ color: "var(--brand-yellow)" }}>AI</span>
        </span>
      )}
    </div>
  );
}
