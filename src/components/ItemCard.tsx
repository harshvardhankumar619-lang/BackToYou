import { Link } from 'react-router-dom';
import { MapPin, Tag, Package, Clock, ArrowRight } from 'lucide-react';
import type { LostItem, FoundItem } from '@/types';
import { daysAgo } from '@/types';
import { StatusBadge } from '@/components/StatusTracker';

type Item = LostItem | FoundItem;

interface ItemCardProps {
  item: Item;
  type: 'lost' | 'found';
}

function isLostItem(item: Item): item is LostItem {
  return (item as LostItem).date_lost !== undefined;
}

export default function ItemCard({ item, type }: ItemCardProps) {
  const date = isLostItem(item) ? item.date_lost : (item as FoundItem).date_found;
  const location = isLostItem(item) ? item.location_lost : (item as FoundItem).location_found;
  const images = item.image_urls?.length > 0 ? item.image_urls : (item.image_url ? [item.image_url] : []);
  const isExpired = item.status === 'expired';

  const typeBadge = type === 'lost' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600';

  return (
    <Link
      to={`/item/${type}/${item.id}`}
      className={`group block bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-200 overflow-hidden ${
        isExpired ? 'opacity-60' : ''
      }`}
    >
      {/* Image / placeholder */}
      <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center relative overflow-hidden">
        {images.length > 0 ? (
          <img
            src={images[0]}
            alt={item.item_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <Package className="w-12 h-12 text-slate-300 group-hover:scale-110 transition-transform duration-300" />
        )}
        <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold ${typeBadge}`}>
          {type === 'lost' ? 'Lost' : 'Found'}
        </span>
        <div className="absolute top-3 right-3">
          <StatusBadge status={item.status} />
        </div>
        {/* Arrow indicator on hover */}
        <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-sm">
          <ArrowRight className="w-4 h-4 text-teal-600" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-slate-800 text-base mb-2 line-clamp-1 group-hover:text-teal-600 transition-colors">
          {item.item_name}
        </h3>
        <div className="space-y-1.5 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
            <span className="truncate">{item.category}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
            <span className="truncate">{location}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
              <span>{daysAgo(item.created_at)}</span>
            </div>
            {item.reference_code && (
              <span className="text-xs text-slate-400 font-mono">{item.reference_code}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
