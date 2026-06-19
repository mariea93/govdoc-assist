import logoImage from "@/assets/logo.png";

export function Logo({ className = "h-11 w-11", showText = true, textClassName = "" }: { className?: string; showText?: boolean; textClassName?: string }) {
  return (
    <div className="flex items-center gap-2">
      <img src={logoImage} alt="GovLingua AI" className={`${className} rounded-md object-contain`} />
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
