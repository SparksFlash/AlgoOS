'use client';

import { useEffect, useRef } from 'react';
import { useCPUStore } from '@/stores/cpu-store';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Zap } from 'lucide-react';

interface PlaybackControlsProps {
  totalSteps: number;
}

export default function PlaybackControls({ totalSteps }: PlaybackControlsProps) {
  const { currentStep, isPlaying, speed, setStep, setPlaying, setSpeed, reset } = useCPUStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setStep(Math.min(currentStep + 1, totalSteps));
        if (currentStep + 1 >= totalSteps) setPlaying(false);
      }, 1000 / speed);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, currentStep, speed, totalSteps, setStep, setPlaying]);

  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Controls */}
        <Button variant="ghost" size="sm"
          onClick={() => setStep(0)}
          className="h-8 w-8 p-0 text-white/40 hover:text-white hover:bg-white/10">
          <SkipBack className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm"
          onClick={() => setStep(Math.max(0, currentStep - 1))}
          className="h-8 px-3 text-white/60 hover:text-white hover:bg-white/10 text-xs">
          −1
        </Button>
        <Button
          size="sm"
          onClick={() => {
            if (currentStep >= totalSteps) { setStep(0); }
            setPlaying(!isPlaying);
          }}
          className="h-8 px-4 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/20"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span className="ml-1.5 text-xs">{isPlaying ? 'Pause' : 'Play'}</span>
        </Button>
        <Button variant="ghost" size="sm"
          onClick={() => setStep(Math.min(totalSteps, currentStep + 1))}
          className="h-8 px-3 text-white/60 hover:text-white hover:bg-white/10 text-xs">
          +1
        </Button>
        <Button variant="ghost" size="sm"
          onClick={() => setStep(totalSteps)}
          className="h-8 w-8 p-0 text-white/40 hover:text-white hover:bg-white/10">
          <SkipForward className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm"
          onClick={() => { reset(); setStep(0); setPlaying(false); }}
          className="h-8 w-8 p-0 text-white/30 hover:text-red-400 hover:bg-red-400/10 ml-1">
          <RotateCcw className="w-3.5 h-3.5" />
        </Button>

        {/* Progress */}
        <div className="flex-1 min-w-[120px] mx-2">
          <Slider
            value={[currentStep]}
            onValueChange={(vals) => { setStep((vals as number[])[0]); setPlaying(false); }}
            max={totalSteps}
            step={1}
            className="w-full"
          />
        </div>
        <span className="text-xs font-mono text-white/40">{currentStep}/{totalSteps}</span>

        {/* Speed */}
        <div className="flex items-center gap-1.5 ml-2">
          <Zap className="w-3 h-3 text-white/30" />
          <select
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="h-7 text-xs bg-white/5 border border-white/10 rounded text-white/60 px-1 cursor-pointer"
          >
            <option value={0.5}>0.5×</option>
            <option value={1}>1×</option>
            <option value={2}>2×</option>
            <option value={4}>4×</option>
          </select>
        </div>
      </div>
    </div>
  );
}
