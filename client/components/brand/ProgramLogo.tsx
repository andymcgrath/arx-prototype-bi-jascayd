import { PROGRAM } from "@/config/branding";

interface ProgramLogoProps {
  /** "colors" → brand-colored logo, for white/light backgrounds (default)
   *  "white"  → all-white logo, for teal/dark backgrounds */
  variant?: "colors" | "white";
  className?: string;
}

export default function ProgramLogo({
  variant = "colors",
  className,
}: ProgramLogoProps) {
  return (
    <img
      src={PROGRAM.logo[variant]}
      alt={PROGRAM.name}
      className={className}
    />
  );
}
