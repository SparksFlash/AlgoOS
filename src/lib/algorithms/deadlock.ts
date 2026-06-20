export interface BankersInput {
  processes: string[];
  resources: string[];
  allocation: number[][];
  max: number[][];
  available: number[];
}

export interface BankersStep {
  work: number[];
  finish: boolean[];
  chosen: string | null;
  safeSequence: string[];
  description: string;
}

export interface BankersResult {
  isSafe: boolean;
  safeSequence: string[];
  steps: BankersStep[];
  need: number[][];
}

export function computeNeed(allocation: number[][], max: number[][]): number[][] {
  return max.map((row, i) => row.map((v, j) => v - allocation[i][j]));
}

export function bankersAlgorithm(input: BankersInput): BankersResult {
  const { processes, resources, allocation, max, available } = input;
  const n = processes.length;
  const m = resources.length;
  const need = computeNeed(allocation, max);
  const work = [...available];
  const finish = Array(n).fill(false);
  const safeSequence: string[] = [];
  const steps: BankersStep[] = [];

  steps.push({
    work: [...work],
    finish: [...finish],
    chosen: null,
    safeSequence: [],
    description: `Initial state. Work = [${work.join(', ')}]`,
  });

  let progress = true;
  while (progress && safeSequence.length < n) {
    progress = false;
    for (let i = 0; i < n; i++) {
      if (finish[i]) continue;
      const canAllocate = need[i].every((v, j) => v <= work[j]);
      if (canAllocate) {
        for (let j = 0; j < m; j++) work[j] += allocation[i][j];
        finish[i] = true;
        safeSequence.push(processes[i]);
        progress = true;
        steps.push({
          work: [...work],
          finish: [...finish],
          chosen: processes[i],
          safeSequence: [...safeSequence],
          description: `Process ${processes[i]} can proceed. Need [${need[i].join(', ')}] ≤ Work. After release: Work = [${work.join(', ')}]`,
        });
        break;
      }
    }
  }

  const isSafe = safeSequence.length === n;
  if (!isSafe) {
    steps.push({
      work: [...work],
      finish: [...finish],
      chosen: null,
      safeSequence: [...safeSequence],
      description: 'No more processes can proceed. DEADLOCK detected!',
    });
  }

  return { isSafe, safeSequence, steps, need };
}

export interface RAGNode {
  id: string;
  type: 'process' | 'resource';
  instances?: number;
}

export interface RAGEdge {
  from: string;
  to: string;
  type: 'request' | 'assignment';
}

export function detectCycle(nodes: RAGNode[], edges: RAGEdge[]): string[] | null {
  const adj: Map<string, string[]> = new Map();
  nodes.forEach((n) => adj.set(n.id, []));

  for (const e of edges) {
    if (e.type === 'request') {
      adj.get(e.from)?.push(e.to);
    } else {
      adj.get(e.from)?.push(e.to);
    }
  }

  const visited = new Set<string>();
  const recStack = new Set<string>();
  const path: string[] = [];

  function dfs(node: string): boolean {
    visited.add(node);
    recStack.add(node);
    path.push(node);
    for (const neighbor of adj.get(node) ?? []) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) return true;
      } else if (recStack.has(neighbor)) {
        path.push(neighbor);
        return true;
      }
    }
    recStack.delete(node);
    path.pop();
    return false;
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      if (dfs(node.id)) return path;
    }
  }
  return null;
}
