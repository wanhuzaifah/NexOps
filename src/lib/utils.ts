import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRM(amount: number): string {
  return `RM ${amount.toLocaleString('ms-MY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('ms-MY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function daysOverdue(dueDate: string): number {
  const due = new Date(dueDate)
  const today = new Date()
  const diff = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
  return diff > 0 ? diff : 0
}

export function getDaysUntil(date: string): number {
  const target = new Date(date)
  const today = new Date()
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}
