import {
  startOfDay,
  endOfDay,
  parseISO,
  differenceInSeconds,
  parse,
  eachDayOfInterval,
  format,
} from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

function getExpirationDate(timeText: string): Date {
  const regex = /^(\d+)(m|h|d|mo)$/;
  const match = timeText.match(regex);

  if (!match) {
    throw new Error('Invalid time format. Use format like: 7m, 24h, 30d, 1mo');
  }

  const value = parseInt(match[1]);
  const unit = match[2];
  const now = new Date();

  switch (unit) {
    case 'm':
      return new Date(now.getTime() + value * 60 * 1000);
    case 'h':
      return new Date(now.getTime() + value * 60 * 60 * 1000);
    case 'd':
      return new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
    case 'mo':
      const futureDate = new Date(now);
      futureDate.setMonth(now.getMonth() + value);
      return futureDate;
    default:
      throw new Error(
        'Invalid time unit. Use m (minutes), h (hours), d (days), or mo (months)',
      );
  }
}

function createDateRangeFilter(
  startDate: string,
  endDate?: string,
  timezone: string = 'UTC',
): { gte: Date; lte: Date } | null {
  if (!startDate) return null;

  const start = parseISO(startDate);
  const end = endDate ? parseISO(endDate) : start;

  if (start.toDateString() === end.toDateString()) {
    const startOfDayLocal = startOfDay(start);
    const endOfDayLocal = endOfDay(end);

    const startOfDayZoned = toZonedTime(startOfDayLocal, timezone);
    const endOfDayZoned = toZonedTime(endOfDayLocal, timezone);

    return {
      gte: startOfDayZoned,
      lte: endOfDayZoned,
    };
  } else {
    const startOfFirstDay = startOfDay(start);
    const endOfLastDay = endOfDay(end);

    const startOfFirstDayZoned = toZonedTime(startOfFirstDay, timezone);
    const endOfLastDayZoned = toZonedTime(endOfLastDay, timezone);

    return {
      gte: startOfFirstDayZoned,
      lte: endOfLastDayZoned,
    };
  }
}

function getHumanReadableDuration(startTime: string, endTime: string): string {
  const formatString = 'HH:mm:ss';

  const start = parse(startTime, formatString, new Date());
  let end = parse(endTime, formatString, new Date());

  // Handle time that spans past midnight
  if (end < start) {
    end.setDate(end.getDate() + 1);
  }

  let diff = differenceInSeconds(end, start);

  const hours = Math.floor(diff / 3600);
  diff %= 3600;
  const minutes = Math.floor(diff / 60);
  const seconds = diff % 60;

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0) parts.push(`${seconds}s`);

  return parts.length ? parts.join(' ') : '0s';
}

function generateDateRangeArray(
  startDate: string,
  endDate?: string,
  timezone: string = 'UTC',
): string[] {
  if (!startDate) return [];

  const start = parseISO(startDate);
  const end = endDate ? parseISO(endDate) : start;

  const dateRange = eachDayOfInterval({ start, end });

  return dateRange.map((date) => format(date, 'yyyy-MM-dd'));
}

export {
  getExpirationDate,
  createDateRangeFilter,
  getHumanReadableDuration,
  generateDateRangeArray,
};
