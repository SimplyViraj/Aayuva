import { BadRequestException } from '@nestjs/common';
import { canonicalEmail, canonicalPhone, canonicalSubject, displayName } from '../src/modules/identity/normalization';

describe('canonical identity inputs - DEV-012 / VAL-001', () => {
  it('lowercases/trims email without provider dot/plus transformations', () => {
    expect(canonicalEmail('  A.Name+Label@EXAMPLE.TEST ')).toBe('a.name+label@example.test');
    expect(canonicalSubject('EMAIL_PASSWORD', ' A@EXAMPLE.TEST ')).toBe('a@example.test');
  });
  it.each(['not an email', 'a@', '', 'a'.repeat(255) + '@example.test'])('rejects invalid email', (value) => {
    expect(() => canonicalEmail(value)).toThrow(BadRequestException);
  });
  it('uses maintained numbering metadata for Indian canonical numbers', () => {
    expect(canonicalPhone('98765 43210')).toBe('+919876543210');
    expect(canonicalPhone(' +91 98765 43210 ')).toBe('+919876543210');
    expect(canonicalPhone('+9118001234567')).toBe('+9118001234567');
  });
  it.each(['+12025550123', '+910000000000', 'call 9876543210', '+919876543210 ext. 123', ''])('rejects foreign/invalid/extracted/extension inputs', (value) => {
    expect(() => canonicalPhone(value)).toThrow(BadRequestException);
  });
  it('counts display-name Unicode code points after trimming', () => {
    expect(displayName('  Member  ')).toBe('Member');
    expect(displayName('😀'.repeat(100))).toHaveLength(200);
    expect(() => displayName('😀'.repeat(101))).toThrow();
    expect(() => displayName(' ')).toThrow();
  });
  it('preserves provider subjects without applying contact normalization', () => {
    expect(canonicalSubject('APPLE', 'Opaque.Provider+Subject')).toBe('Opaque.Provider+Subject');
    expect(() => canonicalSubject('GOOGLE', '')).toThrow();
  });
});
