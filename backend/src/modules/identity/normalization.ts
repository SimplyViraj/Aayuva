import { BadRequestException } from '@nestjs/common';
import { isEmail } from 'class-validator';
import { parsePhoneNumberFromString } from 'libphonenumber-js/max';
import type { RegistrationMethod } from '../../generated/prisma/client';

export function canonicalEmail(value: string): string {
  if (typeof value !== 'string') throw new BadRequestException();
  const normalized = value.trim().toLowerCase();
  if (normalized.length > 254 || !isEmail(normalized)) throw new BadRequestException();
  // Preserve dots, plus-addressing and provider subjects. No provider rewrites.
  return normalized;
}

export function canonicalPhone(value: string): string {
  if (typeof value !== 'string' || value.length > 64) throw new BadRequestException();
  const phone = parsePhoneNumberFromString(value.trim(), { defaultCountry: 'IN', extract: false });
  if (!phone || !phone.isValid() || phone.country !== 'IN' || phone.ext) throw new BadRequestException();
  return phone.number;
}

export function displayName(value: string): string {
  if (typeof value !== 'string') throw new BadRequestException();
  const name = value.trim();
  if (Array.from(name).length < 1 || Array.from(name).length > 100 || name.includes('\0')) throw new BadRequestException();
  return name;
}

export function canonicalSubject(method: RegistrationMethod, value: string): string {
  if (method === 'PHONE') return canonicalPhone(value);
  if (method === 'EMAIL_PASSWORD') return canonicalEmail(value);
  // Verified Google/Apple stable subjects remain opaque and unchanged.
  if (!['GOOGLE', 'APPLE'].includes(method) || typeof value !== 'string' || !value.length || Array.from(value).length > 255 || value.includes('\0')) throw new BadRequestException();
  return value;
}
