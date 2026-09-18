import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { get } from 'svelte/store';
import { authUser } from '../../platform/auth/auth-state';
import { setAccountWorkspaces } from '../../domain/workspaces/workspace-state';
import { normalizeVeteranImport } from '../../domain/veterans/veteran-normalizer';
import { veteranPayload, veteranProfile, veteranSupportCards } from '../../domain/veterans/veteran-profile';
import { veteranRepository } from '../../domain/veterans/veteran-repository';
import type { VeteranRecord } from '../../domain/veterans/generated/veteran-record';
import { profileRepository } from '../profile/profile-repository';
import { draftScope, importVeteranFiles, syncVeteranDrafts, veteranDrafts, veteranImportBusy } from './veteran-library';

const raw = { trained_chara_id: 11, card_id: 100101, speed: 1200, proper_ground_turf: 8, create_time: '2026-01-01 01:00:00', route_id: 4, factor_id_array: [103], skill_array: [{ skill_id: 20001, level: 2 }], succession_chara_array: [{ position_id: 10, card_id: 100601, factor_id_array: [102], win_saddle_id_array: [100] }] };
const file = (value: unknown) => ({ name: 'veterans.json', size: 100, text: async () => JSON.stringify(value) }) as File;
let saved: Record<string, VeteranRecord[]>;
beforeEach(() => {
  localStorage.clear(); authUser.set(null); setAccountWorkspaces([]); veteranDrafts.set({}); veteranImportBusy.set(false); saved = {};
  vi.spyOn(veteranRepository, 'query').mockImplementation(async scope => structuredClone(saved[scope] ?? []));
  vi.spyOn(veteranRepository, 'import').mockImplementation(async (scope, values) => {
    const next = normalizeVeteranImport(values); saved[scope] = [...new Map([...(saved[scope] ?? []), ...next].map(value => [value.recordId, value])).values()];
    return { inserted: next.length, updated: 0, total: next.length };
  });
  vi.spyOn(veteranRepository, 'replace').mockImplementation(async (scope, values) => { saved[scope] = values as VeteranRecord[]; return values.length; });
  vi.spyOn(profileRepository, 'ingestVeterans').mockResolvedValue({ inserted: 1, updated: 0, deleted: 0, total: 1 });
  vi.spyOn(profileRepository, 'load').mockResolvedValue({ veterans: [raw] } as never);
});
afterEach(() => vi.restoreAllMocks());
function signIn() { authUser.set({ id: 'login-one', display_name: 'Trainer', created_at: '' }); localStorage.setItem('auth_token', 'first-token'); setAccountWorkspaces([{ accountId: '111', label: 'First' }, { accountId: '222', label: 'Second' }]); }

it('retains extractor fields, parent wins and encoded data across device storage and account upload', () => {
  const [record] = normalizeVeteranImport({ data: { trained_chara_array: [raw] } });
  expect(veteranProfile(record!)).toMatchObject({ card_id: 100101, proper_ground_turf: 8, creation_time: raw.create_time, factors: [103], skill_array: raw.skill_array, succession_chara_array: [{ factor_id_array: [102], win_saddle_id_array: [100] }] });
  expect(veteranPayload(record!)).toMatchObject({ route_id: 4, factor_info_array: [{ factor_id: 10, level: 3 }], trained_chara_id: 11 });
  expect(normalizeVeteranImport(raw)).toHaveLength(1);
});
it('preserves support limit breaks through imports and distinguishes zero from missing or invalid values', () => {
  const support_card_list = [{ support_card_id:30028, limit_break_count:4 }, { support_card_id:30016, limit_break_count:0 }];
  const [record] = normalizeVeteranImport({ ...raw, support_card_list });
  expect(veteranProfile(record!)).toMatchObject({ support_cards:[30028,30016], support_card_list });
  expect(veteranPayload(record!)).toMatchObject({ support_card_list });
  expect(veteranSupportCards({ support_cards:[30016,30028,30003,30009,20023,30011,30012], support_card_list:[...support_card_list,
    { support_card_id:30003, limit_break_count:5 }, { support_card_id:30009, limit_break_count:-1 },
    { support_card_id:20023, limit_break_count:2.5 }, { support_card_id:30011, limit_break_count:'3' }
  ] }).map(card => card.limit_break_count)).toEqual([0,4,null,null,null,null,null]);
});
it('imports guests without network writes and validates every file before changing storage', async () => {
  await importVeteranFiles([file({ veterans: [raw] })]);
  expect(saved.local).toHaveLength(1); expect(get(veteranDrafts).local).toHaveLength(1);
  await expect(importVeteranFiles([file([{ ...raw, trained_chara_id: 12 }]), file([{ card_id: 0 }])])).rejects.toThrow();
  expect(saved.local).toHaveLength(1); expect(profileRepository.ingestVeterans).not.toHaveBeenCalled();
});
it('retains failed uploads in the original account and retries without losing the device copy', async () => {
  signIn(); vi.mocked(profileRepository.ingestVeterans).mockRejectedValueOnce(new Error('Offline'));
  await expect(importVeteranFiles([file([raw])], '111')).rejects.toThrow('Saved on this device');
  expect(saved[draftScope('111')]).toHaveLength(1); expect(saved[draftScope('222')]).toBeUndefined();
  await syncVeteranDrafts('111'); expect(saved[draftScope('111')]).toEqual([]);
  expect(profileRepository.ingestVeterans).toHaveBeenLastCalledWith('111', [expect.objectContaining({ trained_chara_id: 11 })]);
});
it('adds guest imports to the chosen account after sign-in, keeping a device recovery copy', async () => {
  await importVeteranFiles([file(raw)]); signIn(); await syncVeteranDrafts('222', true);
  expect(profileRepository.ingestVeterans).toHaveBeenCalledWith('222', [expect.objectContaining({ card_id: 100101 })]);
  expect(saved.local).toHaveLength(1); expect(saved[draftScope('222')]).toEqual([]);
  expect(draftScope('222', 'another-login')).not.toBe(draftScope('222'));
});
it('does not post an upload under a changed sign-in session while reading a file', async () => {
  signIn(); let release!: (text: string) => void;
  const slow = { ...file(raw), text: () => new Promise<string>(resolve => release = resolve) } as File;
  const importing = importVeteranFiles([slow], '111');
  localStorage.setItem('auth_token', 'replacement-token'); release(JSON.stringify(raw));
  await expect(importing).rejects.toThrow('sign-in session changed');
  expect(profileRepository.ingestVeterans).not.toHaveBeenCalled(); expect(veteranRepository.import).not.toHaveBeenCalled();
});
it('keeps imports missing required server IDs locally and never attempts a destructive fallback endpoint', async () => {
  signIn(); await expect(importVeteranFiles([file({ card_id: 100101 })], '111')).rejects.toThrow('missing trained character IDs');
  expect(saved[draftScope('111')]).toHaveLength(1); expect(profileRepository.ingestVeterans).not.toHaveBeenCalled();
});
it('keeps the recovery copy when the upload succeeds but the account read is stale', async () => {
  signIn(); vi.mocked(profileRepository.load).mockResolvedValueOnce({ veterans: [] } as never);
  await expect(importVeteranFiles([file(raw)], '111')).rejects.toThrow('has not refreshed yet');
  expect(saved[draftScope('111')]).toHaveLength(1); expect(veteranRepository.replace).not.toHaveBeenCalled();
});
