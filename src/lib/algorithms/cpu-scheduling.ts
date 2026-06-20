export interface Process {
  id: string;
  arrivalTime: number;
  burstTime: number;
  priority: number;
  color: string;
}

export interface GanttBlock {
  pid: string;
  start: number;
  end: number;
  color: string;
}

export interface ProcessMetrics {
  id: string;
  arrivalTime: number;
  burstTime: number;
  completionTime: number;
  turnaroundTime: number;
  waitingTime: number;
  responseTime: number;
  color: string;
}

export interface SchedulingResult {
  gantt: GanttBlock[];
  metrics: ProcessMetrics[];
  avgWaiting: number;
  avgTurnaround: number;
  avgResponse: number;
  cpuUtilization: number;
}

const PROCESS_COLORS = [
  '#f59e0b', '#10b981', '#ef4444', '#3b82f6',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
];

export function assignColors(processes: Omit<Process, 'color'>[]): Process[] {
  return processes.map((p, i) => ({ ...p, color: PROCESS_COLORS[i % PROCESS_COLORS.length] }));
}

function calcMetrics(
  processes: Process[],
  completionMap: Map<string, number>,
  responseMap: Map<string, number>,
): ProcessMetrics[] {
  return processes.map((p) => {
    const ct = completionMap.get(p.id) ?? 0;
    const tat = ct - p.arrivalTime;
    const wt = tat - p.burstTime;
    const rt = (responseMap.get(p.id) ?? ct) - p.arrivalTime;
    return {
      id: p.id,
      arrivalTime: p.arrivalTime,
      burstTime: p.burstTime,
      completionTime: ct,
      turnaroundTime: tat,
      waitingTime: wt,
      responseTime: rt,
      color: p.color,
    };
  });
}

function summarize(metrics: ProcessMetrics[], gantt: GanttBlock[], totalTime: number): SchedulingResult {
  const n = metrics.length;
  const avgWaiting = metrics.reduce((s, m) => s + m.waitingTime, 0) / n;
  const avgTurnaround = metrics.reduce((s, m) => s + m.turnaroundTime, 0) / n;
  const avgResponse = metrics.reduce((s, m) => s + m.responseTime, 0) / n;
  const burstSum = metrics.reduce((s, m) => s + m.burstTime, 0);
  const cpuUtilization = totalTime > 0 ? (burstSum / totalTime) * 100 : 0;
  return { gantt, metrics, avgWaiting, avgTurnaround, avgResponse, cpuUtilization };
}

export function fcfs(processes: Process[]): SchedulingResult {
  const sorted = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
  const gantt: GanttBlock[] = [];
  const completionMap = new Map<string, number>();
  const responseMap = new Map<string, number>();
  let time = 0;

  for (const p of sorted) {
    if (time < p.arrivalTime) time = p.arrivalTime;
    responseMap.set(p.id, time);
    gantt.push({ pid: p.id, start: time, end: time + p.burstTime, color: p.color });
    time += p.burstTime;
    completionMap.set(p.id, time);
  }

  const metrics = calcMetrics(processes, completionMap, responseMap);
  return summarize(metrics, gantt, time);
}

export function sjf(processes: Process[]): SchedulingResult {
  const remaining = processes.map((p) => ({ ...p, remaining: p.burstTime, started: false }));
  const gantt: GanttBlock[] = [];
  const completionMap = new Map<string, number>();
  const responseMap = new Map<string, number>();
  let time = 0;
  let done = 0;

  while (done < processes.length) {
    const available = remaining.filter((p) => p.arrivalTime <= time && completionMap.get(p.id) === undefined);
    if (available.length === 0) {
      time++;
      continue;
    }
    available.sort((a, b) => a.burstTime - b.burstTime);
    const p = available[0];
    if (!p.started) { responseMap.set(p.id, time); p.started = true; }
    gantt.push({ pid: p.id, start: time, end: time + p.burstTime, color: p.color });
    time += p.burstTime;
    completionMap.set(p.id, time);
    done++;
  }

  const metrics = calcMetrics(processes, completionMap, responseMap);
  return summarize(metrics, gantt, time);
}

export function srtf(processes: Process[]): SchedulingResult {
  const remaining = processes.map((p) => ({ ...p, rem: p.burstTime, started: false }));
  const gantt: GanttBlock[] = [];
  const completionMap = new Map<string, number>();
  const responseMap = new Map<string, number>();
  let time = 0;
  let done = 0;
  const maxTime = processes.reduce((s, p) => s + p.burstTime, 0) + Math.max(...processes.map((p) => p.arrivalTime));

  while (done < processes.length && time <= maxTime) {
    const available = remaining.filter((p) => p.arrivalTime <= time && p.rem > 0);
    if (available.length === 0) { time++; continue; }
    available.sort((a, b) => a.rem - b.rem);
    const p = available[0];
    if (!p.started) { responseMap.set(p.id, time); p.started = true; }
    const last = gantt[gantt.length - 1];
    if (last && last.pid === p.id) {
      last.end++;
    } else {
      gantt.push({ pid: p.id, start: time, end: time + 1, color: p.color });
    }
    p.rem--;
    time++;
    if (p.rem === 0) { completionMap.set(p.id, time); done++; }
  }

  const merged: GanttBlock[] = [];
  for (const b of gantt) {
    const last = merged[merged.length - 1];
    if (last && last.pid === b.pid && last.end === b.start) { last.end = b.end; }
    else merged.push({ ...b });
  }

  const metrics = calcMetrics(processes, completionMap, responseMap);
  return summarize(metrics, merged, time);
}

export function roundRobin(processes: Process[], quantum: number): SchedulingResult {
  const queue: Array<{ id: string; rem: number; arrivalTime: number; burstTime: number; color: string; started: boolean }> =
    [...processes]
      .sort((a, b) => a.arrivalTime - b.arrivalTime)
      .map((p) => ({ ...p, rem: p.burstTime, started: false }));
  const gantt: GanttBlock[] = [];
  const completionMap = new Map<string, number>();
  const responseMap = new Map<string, number>();
  const readyQueue: typeof queue = [];
  let time = 0;
  let idx = 0;

  while (readyQueue.length > 0 || idx < queue.length) {
    while (idx < queue.length && queue[idx].arrivalTime <= time) {
      readyQueue.push(queue[idx++]);
    }
    if (readyQueue.length === 0) { time = queue[idx]?.arrivalTime ?? time + 1; continue; }

    const p = readyQueue.shift()!;
    if (!p.started) { responseMap.set(p.id, time); p.started = true; }
    const exec = Math.min(p.rem, quantum);
    gantt.push({ pid: p.id, start: time, end: time + exec, color: p.color });
    time += exec;
    p.rem -= exec;

    while (idx < queue.length && queue[idx].arrivalTime <= time) {
      readyQueue.push(queue[idx++]);
    }

    if (p.rem > 0) readyQueue.push(p);
    else completionMap.set(p.id, time);
  }

  const metrics = calcMetrics(processes, completionMap, responseMap);
  return summarize(metrics, gantt, time);
}

export function priorityScheduling(processes: Process[], preemptive = false): SchedulingResult {
  if (!preemptive) {
    const remaining = [...processes];
    const gantt: GanttBlock[] = [];
    const completionMap = new Map<string, number>();
    const responseMap = new Map<string, number>();
    let time = 0;
    let done = 0;

    while (done < processes.length) {
      const available = remaining.filter((p) => p.arrivalTime <= time && !completionMap.has(p.id));
      if (available.length === 0) { time++; continue; }
      available.sort((a, b) => a.priority - b.priority);
      const p = available[0];
      responseMap.set(p.id, time);
      gantt.push({ pid: p.id, start: time, end: time + p.burstTime, color: p.color });
      time += p.burstTime;
      completionMap.set(p.id, time);
      done++;
    }

    const metrics = calcMetrics(processes, completionMap, responseMap);
    return summarize(metrics, gantt, time);
  }

  // Preemptive priority
  const rem = processes.map((p) => ({ ...p, rem: p.burstTime, started: false }));
  const gantt: GanttBlock[] = [];
  const completionMap = new Map<string, number>();
  const responseMap = new Map<string, number>();
  let time = 0;
  let done = 0;
  const maxTime = processes.reduce((s, p) => s + p.burstTime, 0) + Math.max(...processes.map((p) => p.arrivalTime));

  while (done < processes.length && time <= maxTime) {
    const available = rem.filter((p) => p.arrivalTime <= time && p.rem > 0);
    if (available.length === 0) { time++; continue; }
    available.sort((a, b) => a.priority - b.priority);
    const p = available[0];
    if (!p.started) { responseMap.set(p.id, time); p.started = true; }
    const last = gantt[gantt.length - 1];
    if (last && last.pid === p.id) last.end++;
    else gantt.push({ pid: p.id, start: time, end: time + 1, color: p.color });
    p.rem--;
    time++;
    if (p.rem === 0) { completionMap.set(p.id, time); done++; }
  }

  const metrics = calcMetrics(processes, completionMap, responseMap);
  return summarize(metrics, gantt, time);
}

export function mlfq(processes: Process[], quanta = [2, 4, 8]): SchedulingResult {
  const items = processes.map((p) => ({ ...p, rem: p.burstTime, level: 0, started: false }));
  const queues: typeof items[] = quanta.map(() => []);
  const gantt: GanttBlock[] = [];
  const completionMap = new Map<string, number>();
  const responseMap = new Map<string, number>();
  let time = 0;
  let done = 0;
  let idx = 0;
  const sorted = [...items].sort((a, b) => a.arrivalTime - b.arrivalTime);

  while (done < processes.length) {
    while (idx < sorted.length && sorted[idx].arrivalTime <= time) {
      queues[0].push(sorted[idx++]);
    }

    let found = false;
    for (let lvl = 0; lvl < queues.length; lvl++) {
      if (queues[lvl].length === 0) continue;
      const p = queues[lvl].shift()!;
      if (!p.started) { responseMap.set(p.id, time); p.started = true; }
      const q = quanta[lvl];
      const exec = Math.min(p.rem, q);
      gantt.push({ pid: p.id, start: time, end: time + exec, color: p.color });
      time += exec;
      p.rem -= exec;

      while (idx < sorted.length && sorted[idx].arrivalTime <= time) {
        queues[0].push(sorted[idx++]);
      }

      if (p.rem === 0) { completionMap.set(p.id, time); done++; }
      else {
        const nextLevel = Math.min(lvl + 1, queues.length - 1);
        p.level = nextLevel;
        queues[nextLevel].push(p);
      }
      found = true;
      break;
    }
    if (!found) time++;
  }

  const metrics = calcMetrics(processes, completionMap, responseMap);
  return summarize(metrics, gantt, time);
}
