'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Cpu,
  Database,
  HardDrive,
  AlertTriangle,
  GitMerge,
  Home,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Home', icon: Home, chapter: '' },
  { href: '/cpu-scheduling', label: 'CPU Scheduling', icon: Cpu, chapter: 'Ch. 5' },
  { href: '/memory', label: 'Page Replacement', icon: Database, chapter: 'Ch. 9–10' },
  { href: '/disk-scheduling', label: 'Disk Scheduling', icon: HardDrive, chapter: 'Ch. 12' },
  { href: '/deadlock', label: "Deadlock & Banker's", icon: AlertTriangle, chapter: 'Ch. 8' },
  { href: '/synchronization', label: 'Synchronization', icon: GitMerge, chapter: 'Ch. 6–7' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] flex flex-col z-40 border-r border-white/5"
      style={{ background: 'oklch(0.09 0.01 265)' }}>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <Cpu className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">AlgoOS</p>
            <p className="text-[10px] text-white/40 mt-0.5">OS Algorithm Visualizer</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group',
                active
                  ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5',
              )}
            >
              <Icon className={cn('w-4 h-4 shrink-0', active ? 'text-indigo-400' : 'text-white/30 group-hover:text-white/60')} />
              <span className="flex-1 font-medium">{item.label}</span>
              {item.chapter && (
                <span className={cn('text-[10px] font-mono px-1.5 py-0.5 rounded',
                  active ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/5 text-white/30'
                )}>
                  {item.chapter}
                </span>
              )}
              {active && <ChevronRight className="w-3 h-3 text-indigo-400 shrink-0" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/5 space-y-2">
        <div className="px-1">
          <p className="text-[10px] text-white/30 font-medium">© Sandipto Saha</p>
          <p className="text-[10px] text-white/18">CSE-19 · PSTU</p>
        </div>
      </div>
    </aside>
  );
}
