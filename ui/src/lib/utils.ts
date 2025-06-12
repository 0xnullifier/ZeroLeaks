import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// DateTime formatting utilities for blockchain timestamps
export function formatDateTime(
  timestamp: number,
  options?: {
    showTime?: boolean;
    showSeconds?: boolean;
    relative?: boolean;
  }
) {
  const {
    showTime = true,
    showSeconds = false,
    relative = false,
  } = options || {};

  const date = new Date(timestamp);

  if (relative) {
    return formatRelativeTime(timestamp);
  }

  if (showTime) {
    const timeOptions: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      ...(showSeconds && { second: "2-digit" }),
    };
    return date.toLocaleString("en-US", timeOptions);
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = timestamp - now;
  const absDiff = Math.abs(diff);

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;

  if (absDiff < minute) {
    return diff > 0 ? "in a few seconds" : "a few seconds ago";
  } else if (absDiff < hour) {
    const minutes = Math.floor(absDiff / minute);
    return diff > 0
      ? `in ${minutes} minute${minutes === 1 ? "" : "s"}`
      : `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  } else if (absDiff < day) {
    const hours = Math.floor(absDiff / hour);
    return diff > 0
      ? `in ${hours} hour${hours === 1 ? "" : "s"}`
      : `${hours} hour${hours === 1 ? "" : "s"} ago`;
  } else if (absDiff < week) {
    const days = Math.floor(absDiff / day);
    return diff > 0
      ? `in ${days} day${days === 1 ? "" : "s"}`
      : `${days} day${days === 1 ? "" : "s"} ago`;
  } else if (absDiff < month) {
    const weeks = Math.floor(absDiff / week);
    return diff > 0
      ? `in ${weeks} week${weeks === 1 ? "" : "s"}`
      : `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  } else if (absDiff < year) {
    const months = Math.floor(absDiff / month);
    return diff > 0
      ? `in ${months} month${months === 1 ? "" : "s"}`
      : `${months} month${months === 1 ? "" : "s"} ago`;
  } else {
    const years = Math.floor(absDiff / year);
    return diff > 0
      ? `in ${years} year${years === 1 ? "" : "s"}`
      : `${years} year${years === 1 ? "" : "s"} ago`;
  }
}

// Format deadline with time remaining for bounties
export function formatDeadlineWithTimeLeft(
  deadline: number,
  status?: string
): {
  formatted: string;
  timeLeft: string;
  isExpired: boolean;
} {
  const now = Date.now();
  const timeLeft = deadline - now;
  const isExpired = timeLeft <= 0;

  const formatted = formatDateTime(deadline, { showTime: true });

  if (isExpired || status !== "Open") {
    return {
      formatted,
      timeLeft: isExpired ? "Expired" : "Ended",
      isExpired: true,
    };
  }

  const days = Math.floor(timeLeft / (24 * 60 * 60 * 1000));
  const hours = Math.floor(
    (timeLeft % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)
  );

  let timeLeftStr = "";
  if (days > 0) {
    timeLeftStr = `${days} day${days === 1 ? "" : "s"} left`;
  } else if (hours > 0) {
    timeLeftStr = `${hours} hour${hours === 1 ? "" : "s"} left`;
  } else {
    const minutes = Math.floor(
      (timeLeft % (60 * 60 * 1000)) / (60 * 1000)
    );
    timeLeftStr = `${Math.max(0, minutes)} minute${minutes === 1 ? "" : "s"
      } left`;
  }

  return {
    formatted,
    timeLeft: timeLeftStr,
    isExpired,
  };
}
