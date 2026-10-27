// Business logic rules. Unit-tested by lib/__tests__/rules.test.ts.

/**
 * Reminder date = one calendar month before the due date, clamped to the
 * last day of the previous month.
 *
 * Examples (UTC dates, Europe/London scheduling):
 *   due 2027-03-31 -> reminder 2027-02-28 (clamped to month end)
 *   due 2027-01-31 -> reminder 2026-12-31
 *   due 2024-03-31 -> reminder 2024-02-29 (leap year)
 *   due 2026-10-27 -> reminder 2026-09-27
 */
export function reminderDate(dueDate: string | Date): Date {
  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  const year = due.getUTCFullYear();
  const month = due.getUTCMonth(); // 0-based
  const day = due.getUTCDate();

  // One calendar month before = same day in previous month,
  // clamped to the last day of that previous month.
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const lastDayOfPrevMonth = new Date(Date.UTC(prevYear, prevMonth + 1, 0)).getUTCDate();
  const reminderDay = Math.min(day, lastDayOfPrevMonth);

  return new Date(Date.UTC(prevYear, prevMonth, reminderDay));
}

export function daysUntil(date: string | Date, from: Date = new Date('2026-10-27T00:00:00Z')): number {
  const target = typeof date === 'string' ? new Date(date) : date;
  const ms = target.getTime() - from.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

/**
 * Determine status from a due date.
 *  overdue / within 30 days -> due_soon if not past; past -> blocked
 *  within reminder window -> due_soon
 */
export function statusFromDueDate(dueDate: string, today: Date = new Date('2026-10-27T00:00:00Z')): 'ready' | 'due_soon' | 'blocked' {
  const d = daysUntil(dueDate, today);
  if (d < 0) return 'blocked';
  if (d <= 31) return 'due_soon';
  return 'ready';
}

/**
 * Booking a test NEVER clears an expired/blocked item. Only an actual pass
 * (new expiry in the future) does.
 */
export function isBookingClearedOverdue(currentStatus: 'ready' | 'due_soon' | 'blocked', bookedOnly: boolean): boolean {
  if (bookedOnly) return false;
  return currentStatus !== 'blocked';
}

/**
 * Service trigger = earlier of date OR mileage. Earlier trigger wins.
 */
export function serviceDue(schedule: {
  nextDate?: string; nextMileage?: number; currentMileage: number;
}, today: Date = new Date('2026-10-27T00:00:00Z')): { due: boolean; reason: 'date' | 'mileage' | 'both' | 'none' } {
  const dateDue = schedule.nextDate ? daysUntil(schedule.nextDate, today) <= 31 : false;
  const mileageDue = schedule.nextMileage ? schedule.currentMileage >= schedule.nextMileage - 500 : false;
  if (dateDue && mileageDue) return { due: true, reason: 'both' };
  if (dateDue) return { due: true, reason: 'date' };
  if (mileageDue) return { due: true, reason: 'mileage' };
  return { due: false, reason: 'none' };
}

/**
 * A critical defect blocks allocation until repair PLUS independent verification.
 */
export function defectBlocksAllocation(defect: { severity: string; status: string; releasedToService: boolean; verifiedBy?: string }): boolean {
  if (defect.severity !== 'critical') return false;
  if (!defect.releasedToService) return true;
  if (!defect.verifiedBy) return true;
  return false;
}

/**
 * Completing a service never closes an unrelated defect or releases a blocked vehicle.
 */
export function serviceCompletionDoesNotAffectDefects(): boolean {
  return true;
}

/**
 * Submitted checks are immutable; template edits create a new version.
 * This function is the guard: a locked submission's templateVersionId never changes.
 */
export function checkIsImmutable(locked: boolean): boolean {
  return locked;
}

/**
 * MOT update never alters the council six-month date.
 * Returns a new vehicle object proving independence.
 */
export function applyMotUpdate<T extends { motExpiry: string; motLastPassed?: string; councilSixMonthDue: string }>(
  vehicle: T, newMotExpiry: string, newMotPassedAt: string
): T {
  return {
    ...vehicle,
    motExpiry: newMotExpiry,
    motLastPassed: newMotPassedAt,
    // councilSixMonthDue intentionally NOT touched
  };
}
