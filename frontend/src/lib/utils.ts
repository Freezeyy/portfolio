export function formatDateRange(
  startDate?: string | null,
  endDate?: string | null
): string {
  const format = (value: string) =>
    new Date(value).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });

  if (!startDate) return '';
  if (!endDate) return `${format(startDate)} — Present`;
  return `${format(startDate)} — ${format(endDate)}`;
}

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}
