'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { PageResult } from '@/lib/algorithms/page-replacement';
import { useMemoryStore } from '@/stores/memory-store';

interface PageFrameGridProps {
  result: PageResult;
  frameCount: number;
  referenceString: number[];
}

const PAGE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

function pageColor(page: number) {
  return PAGE_COLORS[page % PAGE_COLORS.length];
}

export default function PageFrameGrid({ result, frameCount, referenceString }: PageFrameGridProps) {
  const { currentStep } = useMemoryStore();
  const steps = result.steps.slice(0, currentStep);
  const current = steps[steps.length - 1];

  return (
    <div className="space-y-4">
      {/* Reference string */}
      <div className="glass rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white/70 mb-3 uppercase tracking-wider">Reference String</h3>
        <div className="flex flex-wrap gap-1.5">
          {referenceString.map((page, i) => {
            const stepData = result.steps[i];
            const isActive = i === currentStep - 1;
            const isPast = i < currentStep - 1;
            return (
              <motion.div
                key={i}
                initial={{ scale: 0.8, opacity: 0.3 }}
                animate={{
                  scale: isActive ? 1.15 : 1,
                  opacity: isPast || isActive ? 1 : 0.35,
                }}
                transition={{ duration: 0.2 }}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold font-mono border transition-all ${
                  isActive
                    ? stepData?.isHit
                      ? 'border-emerald-400 bg-emerald-400/20 text-emerald-300 shadow-lg shadow-emerald-500/20'
                      : 'border-red-400 bg-red-400/20 text-red-300 shadow-lg shadow-red-500/20'
                    : isPast
                    ? stepData?.isHit
                      ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400/60'
                      : 'border-red-500/30 bg-red-500/5 text-red-400/60'
                    : 'border-white/10 bg-white/3 text-white/30'
                }`}
              >
                {page}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Frame state */}
      <div className="glass rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">
            Frame State
            {current && (
              <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-normal normal-case ${
                current.isHit ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'
              }`}>
                {current.isHit ? '✓ Hit' : '✗ Page Fault'}
              </span>
            )}
          </h3>
          {current && (
            <div className="text-right">
              <span className="text-xs text-white/40">Faults: </span>
              <span className="text-sm font-bold text-red-400 font-mono">{current.faultCount}</span>
            </div>
          )}
        </div>

        {/* Frames grid — show all steps as a matrix */}
        <div className="overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {steps.map((step, si) => (
              <div key={si} className="flex flex-col gap-1">
                {Array.from({ length: frameCount }).map((_, fi) => {
                  const page = step.frames[fi];
                  const isNew = si > 0 && step.frames[fi] !== result.steps[si - 1]?.frames[fi];
                  return (
                    <motion.div
                      key={fi}
                      initial={isNew ? { scale: 0.5, opacity: 0 } : false}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className={`w-9 h-9 rounded flex items-center justify-center text-xs font-bold font-mono border ${
                        page === null
                          ? 'bg-white/3 border-white/5 text-white/20'
                          : isNew && !step.isHit
                          ? 'border-red-400/50 bg-red-400/10 text-white'
                          : 'border-white/10 bg-white/5 text-white/80'
                      }`}
                      style={page !== null ? { borderColor: `${pageColor(page)}40`, background: `${pageColor(page)}10` } : {}}
                    >
                      {page ?? '—'}
                    </motion.div>
                  );
                })}
                {/* Fault indicator */}
                <div className={`h-1.5 rounded-full ${step.isHit ? 'bg-emerald-500/30' : 'bg-red-500/50'}`} />
              </div>
            ))}
          </div>
        </div>

        {steps.length === 0 && (
          <div className="flex items-center justify-center h-24 text-white/20 text-sm">
            Step through the reference string to see frame states
          </div>
        )}
      </div>

      {/* Stats */}
      {currentStep > 0 && current && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Page Faults', value: current.faultCount, color: 'text-red-400', bg: 'bg-red-500/10' },
            { label: 'Page Hits', value: currentStep - current.faultCount, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Hit Ratio', value: `${((currentStep - current.faultCount) / currentStep * 100).toFixed(1)}%`, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
          ].map((s) => (
            <div key={s.label} className={`glass rounded-xl p-4 text-center ${s.bg}`}>
              <p className={`text-xl font-bold font-mono ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-white/40 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
