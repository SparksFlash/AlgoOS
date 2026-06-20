'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { GanttBlock } from '@/lib/algorithms/cpu-scheduling';
import { useCPUStore } from '@/stores/cpu-store';

interface GanttChartProps {
  gantt: GanttBlock[];
  totalTime: number;
}

export default function GanttChart({ gantt, totalTime }: GanttChartProps) {
  const { currentStep } = useCPUStore();
  const visibleBlocks = gantt.slice(0, currentStep);

  const containerWidth = Math.max(600, totalTime * 40);

  return (
    <div className="glass rounded-xl p-5 overflow-hidden">
      <h3 className="text-sm font-semibold text-white/70 mb-4 uppercase tracking-wider">
        Gantt Chart
        <span className="ml-2 text-xs text-white/30 normal-case font-normal">
          Step {currentStep}/{gantt.length}
        </span>
      </h3>

      <div className="overflow-x-auto pb-2">
        <div style={{ minWidth: containerWidth }} className="relative">
          {/* CPU Timeline bar */}
          <div className="relative h-12 flex">
            {visibleBlocks.map((block, i) => {
              const width = ((block.end - block.start) / totalTime) * 100;
              const left = (block.start / totalTime) * 100;
              return (
                <motion.div
                  key={`${block.pid}-${i}`}
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  style={{
                    position: 'absolute',
                    left: `${left}%`,
                    width: `${width}%`,
                    background: block.color,
                    transformOrigin: 'left center',
                  }}
                  className="h-full flex items-center justify-center text-white text-xs font-bold rounded-sm border border-white/10"
                  title={`${block.pid}: ${block.start}→${block.end} (${block.end - block.start} units)`}
                >
                  {width > 3 ? block.pid : ''}
                </motion.div>
              );
            })}
            {/* Idle placeholder */}
            {visibleBlocks.length === 0 && (
              <div className="w-full h-full rounded-lg border border-dashed border-white/10 flex items-center justify-center text-white/20 text-xs">
                Run an algorithm to see the Gantt chart
              </div>
            )}
          </div>

          {/* Time labels */}
          <div className="relative h-5 mt-1">
            {[...new Set([...visibleBlocks.flatMap((b) => [b.start, b.end]), 0])].sort((a, b) => a - b).map((t) => (
              <span
                key={t}
                style={{ position: 'absolute', left: `${(t / totalTime) * 100}%`, transform: 'translateX(-50%)' }}
                className="text-[9px] font-mono text-white/30"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      {visibleBlocks.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-white/5">
          {[...new Map(gantt.map((b) => [b.pid, b])).values()].map((b) => (
            <div key={b.pid} className="flex items-center gap-1.5 text-xs text-white/50">
              <div className="w-3 h-3 rounded-sm" style={{ background: b.color }} />
              {b.pid}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
