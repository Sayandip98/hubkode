import {
  formatDistanceToNow,
  format,
  formatRelative,
  isThisYear,
  parseISO,
} from "date-fns";

const parseDate = (date) => {
  if (!date) return null;
  if (date instanceof Date) return date;
  return parseISO(date);
};

const timeAgo = (date) => {
  const parsed = parseDate(date);
  if (!parsed) return "";

  return formatDistanceToNow(parsed, { addSuffix: true });
};

const formatDate = (date, pattern = "MMM d, yyyy") => {
  const parsed = parseDate(date);
  if (!parsed) return "";

  return format(parsed, pattern);
};

const formatDateTime = (date) => {
  const parsed = parseDate(date);
  if (!parsed) return "";

  return format(parsed, "MMM d, yyyy 'at' h:mm a");
};

const formatShortDate = (date) => {
  const parsed = parseDate(date);
  if (!parsed) return "";

  if (isThisYear(parsed)) {
    return format(parsed, "MMM d");
  }

  return format(parsed, "MMM d, yyyy");
};

const formatRelativeDate = (date) => {
  const parsed = parseDate(date);
  if (!parsed) return "";

  return formatRelative(parsed, new Date());
};

const formatISODate = (date) => {
  const parsed = parseDate(date);
  if (!parsed) return "";

  return format(parsed, "yyyy-MM-dd");
};

const formatFullDate = (date) => {
  const parsed = parseDate(date);
  if (!parsed) return "";

  return format(parsed, "EEEE, MMMM d, yyyy");
};

export {
  timeAgo,
  formatDate,
  formatDateTime,
  formatShortDate,
  formatRelativeDate,
  formatISODate,
  formatFullDate,
};
