import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string, short: boolean = false): string {
  // Convert to number and handle invalid inputs
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount

  // Handle invalid numbers
  if (isNaN(numAmount) || numAmount === null || numAmount === undefined) {
    return 'Rp 0'
  }

  // Short format for large numbers
  if (short) {
    const absAmount = Math.abs(numAmount)

    if (absAmount >= 1_000_000_000) {
      // Billions
      return `Rp ${(numAmount / 1_000_000_000).toFixed(1)}B`
    } else if (absAmount >= 1_000_000) {
      // Millions
      return `Rp ${(numAmount / 1_000_000).toFixed(1)}M`
    } else if (absAmount >= 1_000) {
      // Thousands
      return `Rp ${(numAmount / 1_000).toFixed(1)}K`
    }
  }

  // Standard format with proper locale
  return `Rp ${numAmount.toLocaleString("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}`
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}
