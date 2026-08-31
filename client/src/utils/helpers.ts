import { type ClassValue, clsx } from './clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(...inputs);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-PK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}
