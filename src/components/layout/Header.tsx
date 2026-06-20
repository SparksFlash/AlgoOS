'use client';

interface HeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  icon?: React.ReactNode;
}

export default function Header({ title, subtitle, badge, icon }: HeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-start gap-4">
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
            {icon}
          </div>
        )}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            {badge && (
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="text-sm text-white/40">{subtitle}</p>}
        </div>
      </div>
      <div className="mt-4 h-px bg-gradient-to-r from-indigo-500/20 via-purple-500/10 to-transparent" />
    </div>
  );
}
