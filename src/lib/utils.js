import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const formatNumber = (value) => {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

export const formatPhoneNumber = (value) => {
  // Remove all non-digit characters
  let cleaned = ('' + value).replace(/\D/g, '');

  // Match the Uzbekistan phone number format
  let match = cleaned.match(/^(\+998)(\d{2})(\d{3})(\d{4})$/);

  if (match) {
    // Format it to +99893 008 2309
    return `${match[1]}${match[2]} ${match[3]} ${match[4]}`;
  }

  return value; // Return as-is if not matching
};

export const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
};

export const formatDateNew = (date) => {
  if (!date) return 'No date selected';

  // Convert DateValue to JavaScript Date for formatting
  const jsDate = new Date(
    date.year,
    date.month - 1,
    date.day,
    date.hour,
    date.minute
  );

  // Format date as `dd.mm.yyyy hh:mm`
  const formattedDate = jsDate.toLocaleDateString('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const formattedTime = jsDate.toLocaleTimeString('uz-UZ', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });

  return `${formattedDate} ${formattedTime}`;
};

export function formatDateTime(data) {
  const { year, month, day, hour, minute } = data;

  // Format each part to ensure two-digit format where needed
  const formattedDay = String(day).padStart(2, '0');
  const formattedMonth = String(month).padStart(2, '0');
  const formattedYear = String(year);
  const formattedHour = String(hour).padStart(2, '0');
  const formattedMinute = String(minute).padStart(2, '0');

  // Construct the formatted date string
  return `${formattedDay}.${formattedMonth}.${formattedYear} - ${formattedHour}:${formattedMinute}`;
}

export const scoreColor = (studentScore) => {
  return studentScore === 5
    ? 'bg-green-200 dark:bg-green-500'
    : studentScore === 4
    ? 'bg-blue-200 dark:bg-blue-500'
    : studentScore === 3
    ? 'bg-yellow-200 dark:bg-yellow-500'
    : studentScore === 2
    ? 'bg-purple-200 dark:bg-purple-500'
    : studentScore === 1
    ? 'bg-red-200 dark:bg-red-500'
    : 'bg-white dark:bg-muted';
};
