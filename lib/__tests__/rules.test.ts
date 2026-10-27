import { describe, it, expect } from 'vitest';
import {
  reminderDate,
  daysUntil,
  statusFromDueDate,
  isBookingClearedOverdue,
  serviceDue,
  defectBlocksAllocation,
  serviceCompletionDoesNotAffectDefects,
  checkIsImmutable,
  applyMotUpdate,
} from '../rules';

describe('reminderDate', () => {
  it('clamps to last day of previous month for 31 Mar due date', () => {
    const r = reminderDate('2027-03-31');
    expect(r.toISOString()).toBe('2027-02-28T00:00:00.000Z');
  });

  it('handles January due date wrapping to December', () => {
    const r = reminderDate('2027-01-31');
    expect(r.toISOString()).toBe('2026-12-31T00:00:00.000Z');
  });

  it('handles leap year: 31 Mar 2024 -> 29 Feb 2024', () => {
    const r = reminderDate('2024-03-31');
    expect(r.toISOString()).toBe('2024-02-29T00:00:00.000Z');
  });

  it('non-month-end date gives same day in previous month', () => {
    const r = reminderDate('2026-10-27');
    expect(r.toISOString()).toBe('2026-09-27T00:00:00.000Z');
  });

  it('30 November due -> 30 October reminder (both have 30/31 days)', () => {
    const r = reminderDate('2026-11-30');
    expect(r.toISOString()).toBe('2026-10-30T00:00:00.000Z');
  });

  it('31 May due -> 30 April reminder (April has 30 days)', () => {
    const r = reminderDate('2026-05-31');
    expect(r.toISOString()).toBe('2026-04-30T00:00:00.000Z');
  });

  it('accepts a Date object as input', () => {
    const r = reminderDate(new Date('2027-03-31T00:00:00Z'));
    expect(r.toISOString()).toBe('2027-02-28T00:00:00.000Z');
  });
});

describe('daysUntil', () => {
  it('returns 0 for same day', () => {
    expect(daysUntil('2026-10-27')).toBe(0);
  });

  it('returns positive for future date', () => {
    expect(daysUntil('2026-11-26')).toBe(30);
  });

  it('returns negative for past date', () => {
    expect(daysUntil('2026-10-13')).toBe(-14);
  });
});

describe('statusFromDueDate', () => {
  it('returns blocked for past date', () => {
    expect(statusFromDueDate('2026-10-13')).toBe('blocked');
  });

  it('returns due_soon for date within 31 days', () => {
    expect(statusFromDueDate('2026-11-18')).toBe('due_soon');
  });

  it('returns ready for date beyond 31 days', () => {
    expect(statusFromDueDate('2027-06-15')).toBe('ready');
  });

  it('returns due_soon for exactly 31 days', () => {
    expect(statusFromDueDate('2026-11-27')).toBe('due_soon');
  });

  it('returns ready for exactly 32 days', () => {
    expect(statusFromDueDate('2026-11-28')).toBe('ready');
  });
});

describe('isBookingClearedOverdue', () => {
  it('booking alone never clears an overdue (blocked) item', () => {
    expect(isBookingClearedOverdue('blocked', true)).toBe(false);
  });

  it('booking alone does not clear a due_soon item either', () => {
    expect(isBookingClearedOverdue('due_soon', true)).toBe(false);
  });

  it('non-booked, non-blocked is considered cleared', () => {
    expect(isBookingClearedOverdue('ready', false)).toBe(true);
  });

  it('non-booked but blocked is not cleared', () => {
    expect(isBookingClearedOverdue('blocked', false)).toBe(false);
  });
});

describe('serviceDue', () => {
  it('triggers on date when date is within 31 days', () => {
    const r = serviceDue({ nextDate: '2026-11-18', nextMileage: 100000, currentMileage: 50000 });
    expect(r.due).toBe(true);
    expect(r.reason).toBe('date');
  });

  it('triggers on mileage when current mileage within 500 of next', () => {
    const r = serviceDue({ nextDate: '2027-06-15', nextMileage: 50000, currentMileage: 49700 });
    expect(r.due).toBe(true);
    expect(r.reason).toBe('mileage');
  });

  it('triggers on both when both conditions met', () => {
    const r = serviceDue({ nextDate: '2026-11-18', nextMileage: 50000, currentMileage: 49700 });
    expect(r.due).toBe(true);
    expect(r.reason).toBe('both');
  });

  it('returns not due when neither condition met', () => {
    const r = serviceDue({ nextDate: '2027-06-15', nextMileage: 100000, currentMileage: 50000 });
    expect(r.due).toBe(false);
    expect(r.reason).toBe('none');
  });

  it('handles missing nextDate (mileage only)', () => {
    const r = serviceDue({ nextMileage: 50000, currentMileage: 49800 });
    expect(r.due).toBe(true);
    expect(r.reason).toBe('mileage');
  });

  it('handles missing nextMileage (date only)', () => {
    const r = serviceDue({ nextDate: '2026-11-18', currentMileage: 50000 });
    expect(r.due).toBe(true);
    expect(r.reason).toBe('date');
  });
});

describe('defectBlocksAllocation', () => {
  it('non-critical defect never blocks', () => {
    expect(defectBlocksAllocation({ severity: 'minor', status: 'new', releasedToService: false })).toBe(false);
  });

  it('critical defect blocks when not released', () => {
    expect(defectBlocksAllocation({ severity: 'critical', status: 'repair_complete', releasedToService: false })).toBe(true);
  });

  it('critical defect blocks when released but not verified', () => {
    expect(defectBlocksAllocation({ severity: 'critical', status: 'repair_complete', releasedToService: true, verifiedBy: undefined })).toBe(true);
  });

  it('critical defect does not block when released and verified', () => {
    expect(defectBlocksAllocation({ severity: 'critical', status: 'verified', releasedToService: true, verifiedBy: 'Tom Bridger' })).toBe(false);
  });
});

describe('serviceCompletionDoesNotAffectDefects', () => {
  it('always returns true (service completion never affects defects)', () => {
    expect(serviceCompletionDoesNotAffectDefects()).toBe(true);
  });
});

describe('checkIsImmutable', () => {
  it('locked check is immutable', () => {
    expect(checkIsImmutable(true)).toBe(true);
  });

  it('unlocked check is not immutable', () => {
    expect(checkIsImmutable(false)).toBe(false);
  });
});

describe('applyMotUpdate', () => {
  const vehicle = {
    id: 'veh-1',
    motExpiry: '2026-10-13',
    motLastPassed: '2025-10-13',
    councilSixMonthDue: '2026-04-13',
    registration: 'WT65 XPL',
  };

  it('updates MOT expiry and last passed date', () => {
    const updated = applyMotUpdate(vehicle, '2027-10-13', '2026-10-28T10:00:00Z');
    expect(updated.motExpiry).toBe('2027-10-13');
    expect(updated.motLastPassed).toBe('2026-10-28T10:00:00Z');
  });

  it('never alters the council six-month due date', () => {
    const updated = applyMotUpdate(vehicle, '2027-10-13', '2026-10-28T10:00:00Z');
    expect(updated.councilSixMonthDue).toBe('2026-04-13');
  });

  it('preserves all other vehicle properties', () => {
    const updated = applyMotUpdate(vehicle, '2027-10-13', '2026-10-28T10:00:00Z');
    expect(updated.id).toBe('veh-1');
    expect(updated.registration).toBe('WT65 XPL');
  });

  it('does not mutate the original vehicle', () => {
    const original = { ...vehicle };
    applyMotUpdate(vehicle, '2027-10-13', '2026-10-28T10:00:00Z');
    expect(vehicle).toEqual(original);
  });
});
