/*
 * All date logic lives here. Everything is computed in Asia/Kolkata (IST).
 * IST is a fixed UTC+05:30 with no daylight saving, so wall-clock parts are
 * simply the UTC getters of (instant + 5h30m) — exact and dependency-free.
 */

export const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const DAY_MS = 86_400_000;

/* ───────────────────────── getNow() + ?date= override ───────────────────────── */

/**
 * Parses a `?date=` value.
 *  - "2026-09-27"                  → 00:00 IST that day
 *  - "2026-09-26T23:59:55"         → that IST wall-clock time
 *  - "2026-09-26T23:59:55+05:30"   → exactly that instant
 */
export function parseDateParam(raw: string | null | undefined): number | null {
  if (!raw) return null;
  // a '+' in a URL often arrives as a space ("…T23:59:55 05:30")
  const s = raw.trim().replace(/ (\d{2}:?\d{2})$/, '+$1');
  let t: number;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    t = Date.parse(`${s}T00:00:00+05:30`);
  } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(s)) {
    t = Date.parse(`${s}+05:30`);
  } else {
    t = Date.parse(s);
  }
  return Number.isNaN(t) ? null : t;
}

// Offset between the (possibly overridden) clock and the real clock,
// captured once so an overridden clock still ticks forward naturally.
const clockOffset: number = (() => {
  if (typeof window === 'undefined') return 0;
  const override = parseDateParam(new URLSearchParams(window.location.search).get('date'));
  return override === null ? 0 : override - Date.now();
})();

/** The one and only "now" used by the whole site. */
export function getNow(): Date {
  return new Date(Date.now() + clockOffset);
}

export const isTimeOverridden = clockOffset !== 0;

/* ───────────────────────────── IST helpers ───────────────────────────── */

export interface ISTParts {
  y: number;
  mo: number; // 1-12
  d: number;
  h: number;
  mi: number;
  s: number;
  ms: number;
}

export function istParts(date: Date): ISTParts {
  const x = new Date(date.getTime() + IST_OFFSET_MS);
  return {
    y: x.getUTCFullYear(),
    mo: x.getUTCMonth() + 1,
    d: x.getUTCDate(),
    h: x.getUTCHours(),
    mi: x.getUTCMinutes(),
    s: x.getUTCSeconds(),
    ms: x.getUTCMilliseconds(),
  };
}

/** Build an instant from IST wall-clock parts. */
export function istDate(y: number, mo: number, d: number, h = 0, mi = 0, s = 0, ms = 0): Date {
  return new Date(Date.UTC(y, mo - 1, d, h, mi, s, ms) - IST_OFFSET_MS);
}

export function daysInMonth(y: number, mo: number): number {
  return new Date(Date.UTC(y, mo, 0)).getUTCDate();
}

/** Adds whole calendar months (IST), clamping to the month's last day (31 Jan + 1 → 28/29 Feb). */
export function addMonthsIST(date: Date, months: number): Date {
  const p = istParts(date);
  const total = p.y * 12 + (p.mo - 1) + months;
  const y = Math.floor(total / 12);
  const mo = (total % 12) + 1;
  const d = Math.min(p.d, daysInMonth(y, mo));
  return istDate(y, mo, d, p.h, p.mi, p.s, p.ms);
}

/* ─────────────────────────── calendar difference ─────────────────────────── */

export interface Duration {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const ZERO: Duration = { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };

/** Calendar-accurate difference between two instants (in IST). */
export function calendarDiff(start: Date, end: Date): Duration {
  if (end.getTime() <= start.getTime()) return { ...ZERO };
  const a = istParts(start);
  const b = istParts(end);
  let months = (b.y - a.y) * 12 + (b.mo - a.mo);
  let anchor = addMonthsIST(start, months);
  while (anchor.getTime() > end.getTime()) {
    months -= 1;
    anchor = addMonthsIST(start, months);
  }
  const rest = end.getTime() - anchor.getTime();
  return {
    years: Math.floor(months / 12),
    months: months % 12,
    ...splitMs(rest),
  };
}

/** Splits a millisecond span into days/hours/minutes/seconds. */
export function splitMs(ms: number) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(totalSec / 86400),
    hours: Math.floor((totalSec % 86400) / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
  };
}

export function wholeDaysBetween(start: Date, end: Date): number {
  return Math.max(0, Math.floor((end.getTime() - start.getTime()) / DAY_MS));
}

/* ─────────────────────────── anniversaries ─────────────────────────── */

function parseMonthDay(md: string): { mo: number; d: number } {
  const [mo, d] = md.split('-').map(Number);
  return { mo, d };
}

/** The anniversary date in a given year (Feb 29 anniversaries fall on Feb 28 otherwise). */
function anniversaryIn(year: number, md: string): Date {
  const { mo, d } = parseMonthDay(md);
  return istDate(year, mo, Math.min(d, daysInMonth(year, mo)));
}

export function isAnniversaryDay(now: Date, md: string): boolean {
  const p = istParts(now);
  const a = istParts(anniversaryIn(p.y, md));
  return p.mo === a.mo && p.d === a.d;
}

/** Next anniversary at 00:00 IST strictly after today. */
export function nextAnniversary(now: Date, md: string): Date {
  const { y } = istParts(now);
  const thisYear = anniversaryIn(y, md);
  return thisYear.getTime() > now.getTime() ? thisYear : anniversaryIn(y + 1, md);
}

/** Which anniversary a given anniversary date is (2026 with a 2024 start → 2). */
export function anniversaryNumber(anniversary: Date, since: Date): number {
  return istParts(anniversary).y - istParts(since).y;
}

export function ordinal(n: number): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1: return `${n}st`;
    case 2: return `${n}nd`;
    case 3: return `${n}rd`;
    default: return `${n}th`;
  }
}

/* ─────────────────────────── derived "story" state ─────────────────────────── */

export interface StoryState {
  isAnniversary: boolean;
  /** Completed years together. */
  years: number;
  /** e.g. "2nd" — the anniversary being celebrated today, or the completed years. */
  yearsOrdinal: string;
  heroLine: string;
  next: Date;
  nextNumber: number;
  nextOrdinal: string;
}

export function storyState(now: Date, sinceISO: string, md: string): StoryState {
  const since = new Date(sinceISO);
  const diff = calendarDiff(since, now);
  const isAnniversary = isAnniversaryDay(now, md);
  const next = nextAnniversary(now, md);
  const nextNumber = anniversaryNumber(next, since);
  const years = diff.years;
  const plural = (n: number) => `${n} Year${n === 1 ? '' : 's'}`;

  let heroLine: string;
  if (isAnniversary && years > 0) {
    heroLine = `Happy ${ordinal(years)} Anniversary, my love`;
  } else if (next.getTime() - now.getTime() <= 30 * DAY_MS && nextNumber >= 1) {
    heroLine = `Almost ${plural(nextNumber)} Together`;
  } else if (years >= 1) {
    heroLine = `${plural(years)} Together`;
  } else {
    heroLine = `${diff.months} Month${diff.months === 1 ? '' : 's'} Together`;
  }

  return {
    isAnniversary,
    years,
    yearsOrdinal: ordinal(Math.max(years, 1)),
    heroLine,
    next,
    nextNumber,
    nextOrdinal: ordinal(nextNumber),
  };
}
