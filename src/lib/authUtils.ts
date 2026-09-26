import { COLLEGE_DOMAIN } from '@/types';

export function isCollegeEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  return domain === COLLEGE_DOMAIN;
}

export interface PasswordStrengthResult {
  score: 0 | 1 | 2 | 3;
  label: string;
  color: string;
  barColor: string;
  textColor: string;
}

export function getPasswordStrength(password: string): PasswordStrengthResult {
  if (!password) return { score: 0, label: '', color: '', barColor: 'bg-slate-200', textColor: '' };

  let checks = 0;
  if (password.length >= 8) checks++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) checks++;
  if (/\d/.test(password)) checks++;
  if (/[^A-Za-z0-9]/.test(password)) checks++;

  if (password.length < 6 || checks <= 1) {
    return { score: 1, label: 'Weak', color: 'red', barColor: 'bg-red-500', textColor: 'text-red-600' };
  }
  if (checks === 2) {
    return { score: 2, label: 'Medium', color: 'amber', barColor: 'bg-amber-500', textColor: 'text-amber-600' };
  }
  return { score: 3, label: 'Strong', color: 'emerald', barColor: 'bg-emerald-500', textColor: 'text-emerald-600' };
}

export function validatePassword(password: string): { valid: boolean; message: string } {
  if (password.length < 8) return { valid: false, message: 'Password must be at least 8 characters' };
  if (!/[A-Z]/.test(password)) return { valid: false, message: 'Include at least one uppercase letter' };
  if (!/[a-z]/.test(password)) return { valid: false, message: 'Include at least one lowercase letter' };
  if (!/\d/.test(password)) return { valid: false, message: 'Include at least one number' };
  return { valid: true, message: '' };
}

export function mapAuthError(error: string): string {
  const lower = error.toLowerCase();
  if (lower.includes('already registered') || lower.includes('already been registered')) {
    return 'This email is already registered — try logging in instead';
  }
  if (lower.includes('invalid login') || lower.includes('invalid credentials')) {
    return 'Incorrect email or password — please try again';
  }
  if (lower.includes('email not confirmed')) {
    return 'Please verify your email before signing in';
  }
  if (lower.includes('rate limit') || lower.includes('too many')) {
    return 'Too many attempts — please wait a moment and try again';
  }
  if (lower.includes('password should be at least')) {
    return 'Password must be at least 6 characters';
  }
  if (lower.includes('unable to send') || lower.includes('email')) {
    return 'Could not send verification email — please try again';
  }
  if (lower.includes('network') || lower.includes('fetch')) {
    return 'Network error — check your connection and try again';
  }
  return error;
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}
