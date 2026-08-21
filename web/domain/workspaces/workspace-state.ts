import { derived, get, writable } from 'svelte/store';

export interface VeteranWorkspace {
  id: string;
  kind: 'local' | 'account';
  label: string;
  accountId?: string;
  revision?: string;
  syncStatus: 'local' | 'synced' | 'pending' | 'conflict' | 'offline';
}

const ACTIVE_KEY = 'uma:active-workspace';
const localWorkspace: VeteranWorkspace = { id: 'local', kind: 'local', label: 'Local device', syncStatus: 'local' };
export const workspaces = writable<VeteranWorkspace[]>([localWorkspace]);
export const activeWorkspaceId = writable('local');
export const activeWorkspace = derived([workspaces, activeWorkspaceId], ([$workspaces, $id]) => $workspaces.find((workspace) => workspace.id === $id) ?? localWorkspace);

export function initializeWorkspace(): void {
  const saved = window.localStorage.getItem(ACTIVE_KEY);
  if (saved && get(workspaces).some((workspace) => workspace.id === saved)) activeWorkspaceId.set(saved);
}

export function selectWorkspace(id: string): void {
  if (!get(workspaces).some((workspace) => workspace.id === id)) return;
  activeWorkspaceId.set(id);
  window.localStorage.setItem(ACTIVE_KEY, id);
}

export function setAccountWorkspaces(accounts: Array<{ accountId: string; label: string }>): void {
  workspaces.set([localWorkspace, ...accounts.map((account) => ({ id: `account:${account.accountId}`, kind: 'account' as const, label: account.label, accountId: account.accountId, syncStatus: 'pending' as const }))]);
}
