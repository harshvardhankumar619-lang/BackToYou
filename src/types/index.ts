export type UserRole = 'student' | 'admin';

export interface Profile {
  id: string;
  name: string;
  student_id: string | null;
  phone: string | null;
  created_at: string;
  is_verified: boolean;
  role: UserRole;
  trust_score: number;
  avatar_url: string | null;
  verification_token: string | null;
  verification_token_expiry: string | null;
  reset_token: string | null;
  reset_token_expiry: string | null;
}

export type ItemStatus = 'active' | 'matched' | 'resolved' | 'expired';

export interface LostItem {
  id: string;
  user_id: string;
  item_name: string;
  category: string;
  description: string | null;
  date_lost: string;
  location_lost: string;
  image_url: string | null;
  image_urls: string[];
  status: string;
  reference_code: string | null;
  contact_preference: string;
  expires_at: string | null;
  created_at: string;
}

export interface FoundItem {
  id: string;
  user_id: string;
  item_name: string;
  category: string;
  description: string | null;
  date_found: string;
  location_found: string;
  image_url: string | null;
  image_urls: string[];
  status: string;
  reference_code: string | null;
  current_holder_note: string | null;
  good_faith_confirmed: boolean;
  expires_at: string | null;
  created_at: string;
}

export interface Claim {
  id: string;
  lost_item_id: string | null;
  found_item_id: string | null;
  claimant_id: string;
  status: string;
  created_at: string;
}

export const ITEM_CATEGORIES = [
  'Electronics',
  'Bags',
  'Documents/ID',
  'Keys',
  'Clothing',
  'Accessories',
  'Books/Stationery',
  'Other',
] as const;

export const CAMPUS_LOCATIONS = [
  'Library',
  'Main Block',
  'Canteen',
  'Hostel Blocks',
  'Parking Lot',
  'Sports Ground',
  'CS Labs',
  'ISE Labs',
  'ECE Labs',
  'Auditorium',
  'Bus Stop',
  'Other (specify)',
] as const;

export const HOLDER_OPTIONS = [
  'With me',
  'Handed to security',
  'Left at the location',
  'Handed to library desk',
  'Handed to admin office',
  'Other (specify)',
] as const;

export const COLLEGE_DOMAIN = 'cmrit.ac.in';

export function daysAgo(dateStr: string): string {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? '1 month ago' : `${months} months ago`;
}

export function statusBadgeClass(status: string): string {
  switch (status) {
    case 'active': return 'bg-amber-100 text-amber-700';
    case 'matched': return 'bg-blue-100 text-blue-700';
    case 'resolved': return 'bg-emerald-100 text-emerald-700';
    case 'expired': return 'bg-slate-100 text-slate-500';
    default: return 'bg-slate-100 text-slate-500';
  }
}
