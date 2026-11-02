const DEFAULT_DATE_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  dateStyle: 'medium',
  timeStyle: 'short',
};

const ISO_DATE_TIME_PATTERN =
  /\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})(?:\s+UTC)?\b/g;

export function formatDateTime(
  value: string,
  options: Intl.DateTimeFormatOptions = DEFAULT_DATE_TIME_OPTIONS,
) {
  return new Intl.DateTimeFormat('id-ID', options).format(new Date(value));
}

export function formatDateTimesInText(value: string) {
  return value.replace(ISO_DATE_TIME_PATTERN, (dateTime) =>
    formatDateTime(dateTime.replace(/\s+UTC$/, '')),
  );
}
