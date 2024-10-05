import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const formatNumber = (value) => {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

export const formatPhoneNumber = (value) => {
  if (!value) return '';
  const cleaned = value.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{1,3})(\d{0,3})(\d{0,4})$/);
  if (match) {
    const [, areaCode, prefix, lineNumber] = match;
    return `${areaCode ? `+${areaCode}` : ' '} ${prefix}${
      prefix ? ' ' : ' '
    }${lineNumber}`;
  }
  return value;
};

export const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
};
