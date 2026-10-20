import { create } from 'zustand';
import { useStore } from '../store';
import { getClient } from './client';
import { SNAPSHOT_VERSION, Snapshot, applySnapshot, takeSnapshot } from './snapshot';

export type AuthStatus = 'off' | 'loading' | 'signedOut' | 'signedIn';

interface AuthState {
  status: AuthStatus;
  email: string | null;
  userId: string | null;
  busy: boolean;
  error: string | null;
  lastSyncedTs: number | null;
  /** set when sign-in found a cloud copy and this phone has its own data too */
  conflict: { remote: Snapshot; remoteTs: number } | null;
  init: () => Promise<void>;
  sendCode: (email: string) => Promise<boolean>;
  verify: (email: string, code: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<boolean>;
  syncNow: () => Promise<void>;
  resolveConflict: (use: 'cloud' | 'phone') => Promise<void>;
}

const hasLocalData = () => {
  const s = useStore.getState();
  return s.purchases.length > 0 || s.shame.length > 0 || s.wishes.length > 0;
};

async function pull(userId: string): Promise<{ data: Snapshot; ts: number } | null> {
  const c = getClient();
  if (!c) return null;
  const { data, error } = await c.from('snapshots').select('data, updated_at').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { data: data.data as Snapshot, ts: new Date(data.updated_at as string).getTime() };
}

async function push(userId: string): Promise<number> {
  const c = getClient();
  if (!c) throw new Error('offline');
  const ts = Date.now();
  const { error } = await c.from('snapshots').upsert({ user_id: userId, data: takeSnapshot(), updated_at: new Date(ts).toISOString() });
  if (error) throw error;
  return ts;
}

const msg = (e: unknown) => (e instanceof Error ? e.message : String(e));

export const useAuth = create<AuthState>((set, get) => ({
  status: 'off',
  email: null,
  userId: null,
  busy: false,
  error: null,
  lastSyncedTs: null,
  conflict: null,

  init: async () => {
    const c = getClient();
    if (!c) return set({ status: 'off' });
    set({ status: 'loading' });
    const { data } = await c.auth.getSession();
    const u = data.session?.user;
    set({ status: u ? 'signedIn' : 'signedOut', email: u?.email ?? null, userId: u?.id ?? null });
    c.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      set({ status: user ? 'signedIn' : 'signedOut', email: user?.email ?? null, userId: user?.id ?? null });
    });
  },

  sendCode: async (email) => {
    const c = getClient();
    if (!c) return false;
    set({ busy: true, error: null });
    const { error } = await c.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: true } });
    set({ busy: false, error: error ? error.message : null });
    return !error;
  },

  verify: async (email, code) => {
    const c = getClient();
    if (!c) return false;
    set({ busy: true, error: null });
    const { data, error } = await c.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: 'email' });
    if (error || !data.user) {
      set({ busy: false, error: error?.message ?? 'Could not sign in' });
      return false;
    }
    set({ status: 'signedIn', email: data.user.email ?? null, userId: data.user.id });
    try {
      const remote = await pull(data.user.id);
      if (!remote) {
        const ts = await push(data.user.id);
        set({ lastSyncedTs: ts });
      } else if (!hasLocalData()) {
        applySnapshot(remote.data);
        set({ lastSyncedTs: remote.ts });
      } else {
        set({ conflict: { remote: remote.data, remoteTs: remote.ts } });
      }
      set({ busy: false });
    } catch (e) {
      set({ busy: false, error: msg(e) });
    }
    return true;
  },

  signOut: async () => {
    const c = getClient();
    if (c) await c.auth.signOut();
    set({ status: 'signedOut', email: null, userId: null, lastSyncedTs: null, conflict: null });
  },

  deleteAccount: async () => {
    const c = getClient();
    if (!c) return false;
    set({ busy: true, error: null });
    // The function deletes the auth user with the service key; tables cascade from auth.users.
    const { error } = await c.functions.invoke('delete-account', { method: 'POST' });
    if (error) {
      set({ busy: false, error: error.message });
      return false;
    }
    await c.auth.signOut().catch(() => {});
    set({ busy: false, status: 'signedOut', email: null, userId: null, lastSyncedTs: null, conflict: null });
    return true;
  },

  syncNow: async () => {
    const { userId, status } = get();
    if (!userId || status !== 'signedIn') return;
    set({ busy: true, error: null });
    try {
      const ts = await push(userId);
      set({ lastSyncedTs: ts, busy: false });
    } catch (e) {
      set({ busy: false, error: msg(e) });
    }
  },

  resolveConflict: async (use) => {
    const { conflict, userId } = get();
    if (!conflict || !userId) return;
    set({ busy: true });
    try {
      if (use === 'cloud') {
        applySnapshot(conflict.remote);
        set({ lastSyncedTs: conflict.remoteTs });
      } else {
        const ts = await push(userId);
        set({ lastSyncedTs: ts });
      }
      set({ conflict: null, busy: false });
    } catch (e) {
      set({ busy: false, error: msg(e) });
    }
  },
}));

/** Push local changes a few seconds after they stop, while signed in and no conflict is pending. */
let timer: ReturnType<typeof setTimeout> | null = null;
export function startAutoSync(): () => void {
  const unsub = useStore.subscribe(() => {
    const a = useAuth.getState();
    if (a.status !== 'signedIn' || a.conflict || a.busy) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      useAuth.getState().syncNow();
    }, 4000);
  });
  return () => {
    unsub();
    if (timer) clearTimeout(timer);
  };
}

export { SNAPSHOT_VERSION };
