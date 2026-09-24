import type { CardNetwork } from "@/lib/types";
import clsx from "clsx";

interface CardBrandProps {
  network: CardNetwork;
  /** "light" = logos en version claire (carte avec dégradé sombre). */
  variant?: "color" | "light";
  className?: string;
}

export default function CardBrand({ network, variant = "color", className }: CardBrandProps) {
  if (network === "MASTERCARD") {
    return (
      <svg
        viewBox="0 0 38 26"
        className={clsx("h-6 w-auto", className)}
        role="img"
        aria-label="Mastercard"
      >
        <circle cx="13" cy="13" r="8.6" fill="#EB001B" />
        <circle cx="25" cy="13" r="8.6" fill="#F79E1B" />
        <ellipse cx="19" cy="13" rx="3.4" ry="8.6" fill="#FF5F00" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 62 20"
      className={clsx("h-5 w-auto", className)}
      role="img"
      aria-label="Visa"
    >
      <text
        x="0"
        y="15"
        fontFamily="'Segoe UI', Arial, sans-serif"
        fontWeight="800"
        fontStyle="italic"
        fontSize="18"
        letterSpacing="1"
        fill={variant === "light" ? "#FFFFFF" : "#1A1F71"}
      >
        VISA
      </text>
    </svg>
  );
}