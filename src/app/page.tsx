'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Cpu, Database, HardDrive, AlertTriangle, GitMerge, ArrowRight, BookOpen } from 'lucide-react';

const modules = [
  {
    href: '/cpu-scheduling',
    icon: Cpu,
    title: 'CPU Scheduling',
    chapter: 'Chapter 5',
    desc: 'FCFS · SJF · SRTF · Round Robin · Priority · MLFQ',
    highlight: 'Animated Gantt chart with step-by-step playback and performance metrics comparison.',
    color: '#6366f1',
  },
  {
    href: '/memory',
    icon: Database,
    title: 'Page Replacement',
    chapter: 'Chapter 9–10',
    desc: 'FIFO · LRU · Optimal · Clock (Second Chance)',
    highlight: 'Frame-by-frame visualization with hit/fault highlighting and algorithm comparison.',
    color: '#10b981',
  },
  {
    href: '/disk-scheduling',
    icon: HardDrive,
    title: 'Disk Scheduling',
    chapter: 'Chapter 12',
    desc: 'FCFS · SSTF · SCAN · C-SCAN · LOOK · C-LOOK',
    highlight: 'Animated disk head movement with live seek distance tracking and path chart.',
    color: '#f59e0b',
  },
  {
    href: '/deadlock',
    icon: AlertTriangle,
    title: "Deadlock & Banker's",
    chapter: 'Chapter 8',
    desc: "Banker's Safety Algorithm · Need Matrix · Safe Sequence",
    highlight: 'Step-by-step safety algorithm execution with matrix highlighting and deadlock detection.',
    color: '#ef4444',
  },
  {
    href: '/synchronization',
    icon: GitMerge,
    title: 'Synchronization',
    chapter: 'Chapter 6–7',
    desc: 'Dining Philosophers · Producer-Consumer · Semaphores',
    highlight: 'Live simulation of classic OS synchronization problems with semaphore state display.',
    color: '#8b5cf6',
  },
];

const stats = [
  { value: '6+', label: 'CPU Algorithms' },
  { value: '4', label: 'Memory Policies' },
  { value: '6', label: 'Disk Algorithms' },
  { value: '2', label: 'Sync Problems' },
];

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16 pt-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs mb-6">
          <BookOpen className="w-3.5 h-3.5" />
          Abraham Silberschatz · Operating System Concepts · 10th Edition
        </div>

        <h1 className="text-5xl font-black text-white mb-4 leading-tight">
          <span className="gradient-text">AlgoOS</span>
        </h1>
        <p className="text-lg text-white/40 max-w-2xl mx-auto leading-relaxed">
          An interactive, animated playground for understanding Operating System algorithms.
          Step through executions, compare algorithms, and see complex concepts come alive.
        </p>

        {/* Stats */}
        <div className="flex justify-center gap-8 mt-10">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-black gradient-text">{s.value}</p>
              <p className="text-xs text-white/30 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Module cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {modules.map((mod, i) => {
          const Icon = mod.icon;
          return (
            <motion.div
              key={mod.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
            >
              <Link href={mod.href} className="group block h-full">
                <div className="glass rounded-2xl p-6 h-full border border-white/5 hover:border-white/10 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl"
                  style={{ ['--hover-glow' as string]: `${mod.color}20` }}
                >
                  {/* Icon + chapter */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center border"
                      style={{ background: `${mod.color}15`, borderColor: `${mod.color}30` }}>
                      <Icon className="w-5 h-5" style={{ color: mod.color }} />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-1 rounded-full border text-white/30"
                      style={{ borderColor: `${mod.color}20`, background: `${mod.color}08` }}>
                      {mod.chapter}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-lg font-bold text-white mb-1 group-hover:text-white transition-colors">{mod.title}</h2>
                  <p className="text-xs font-mono text-white/30 mb-3">{mod.desc}</p>
                  <p className="text-xs text-white/40 leading-relaxed">{mod.highlight}</p>

                  {/* CTA */}
                  <div className="flex items-center gap-1 mt-5 text-xs font-semibold transition-all"
                    style={{ color: mod.color }}>
                    Explore
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}

        {/* "About this project" card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: modules.length * 0.08, duration: 0.4 }}
          className="glass rounded-2xl p-6 border border-white/5 flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 mb-4">
              <BookOpen className="w-5 h-5 text-white/30" />
            </div>
            <h2 className="text-base font-bold text-white mb-2">Built on Silberschatz</h2>
            <p className="text-xs text-white/35 leading-relaxed">
              Every module maps to a chapter in <em>Operating System Concepts, 10th Edition</em>.
              Algorithms are implemented from scratch following textbook definitions.
            </p>
          </div>
          <div className="mt-5 space-y-2">
            {[
              { label: 'Framework', value: 'Next.js 15' },
              { label: 'Language', value: 'TypeScript' },
              { label: 'Animations', value: 'Framer Motion' },
            ].map((t) => (
              <div key={t.label} className="flex justify-between text-xs">
                <span className="text-white/25">{t.label}</span>
                <span className="text-white/50 font-mono">{t.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="text-center mt-16 pb-6 space-y-1">
        <p className="text-sm font-semibold text-white/40">
          © {new Date().getFullYear()} Sandipto Saha
        </p>
        <p className="text-xs text-white/20">
          CSE-19 · Patuakhali Science and Technology University (PSTU)
        </p>
        <p className="text-[10px] text-white/12 mt-2">
          AlgoOS · OS Algorithm Visualizer · Operating Systems Sessional Project · All rights reserved.
        </p>
      </div>
    </div>
  );
}
