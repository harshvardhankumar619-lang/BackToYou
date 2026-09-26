import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Search, SearchX, PackageCheck, FileText, UserRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import MacOSDock from '@/components/ui/mac-os-dock';
import type { DockItem } from '@/components/ui/mac-os-dock';
import { useAuth } from '@/context/AuthContext';

interface NavItem {
  id: string;
  name: string;
  icon: LucideIcon;
  route: string;
  iconColor?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', name: 'Home', icon: LayoutDashboard, route: '/dashboard' },
  { id: 'browse', name: 'Browse', icon: Search, route: '/browse' },
  { id: 'report-lost', name: 'Report Lost', icon: SearchX, route: '/report/lost', iconColor: '#ef4444' },
  { id: 'report-found', name: 'Report Found', icon: PackageCheck, route: '/report/found', iconColor: '#10b981' },
  { id: 'reports', name: 'My Reports', icon: FileText, route: '/my-reports' },
  { id: 'profile', name: 'Profile', icon: UserRound, route: '/profile' },
];

function getActiveId(pathname: string): string | null {
  for (const item of NAV_ITEMS) {
    if (pathname === item.route) return item.id;
  }
  if (pathname.startsWith('/item/')) return 'browse';
  if (pathname.startsWith('/lost-items')) return 'browse';
  if (pathname.startsWith('/found-items')) return 'browse';
  return null;
}

export default function CampusFindDock() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const activeId = getActiveId(location.pathname);
  const dockItems: DockItem[] = NAV_ITEMS.map((item) => ({
    id: item.id,
    name: item.name,
    icon: item.icon,
    iconColor: item.iconColor,
  }));

  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 z-50 pointer-events-auto"
      style={{ bottom: 'max(1.5rem, env(safe-area-inset-bottom, 1.5rem))' }}
    >
      <MacOSDock
        items={dockItems}
        activeId={activeId}
        onItemClick={(id) => {
          const item = NAV_ITEMS.find((n) => n.id === id);
          if (item) navigate(item.route);
        }}
      />
    </div>
  );
}
