import type { LayoutServerLoad } from './$types';
import { verifyToken } from '$lib/server/auth';
import { ensureIndices } from '$lib/server/elasticsearch';

let indicesReady = false;

export const load: LayoutServerLoad = async ({ cookies }) => {
  if (!indicesReady) {
    try {
      await ensureIndices();
      indicesReady = true;
    } catch (e) {
      console.error('Failed to ensure ES indices:', e);
    }
  }

  const token = cookies.get('auth_token');
  if (!token) return { user: null };
  const payload = verifyToken(token);
  if (!payload) {
    cookies.delete('auth_token', { path: '/' });
    return { user: null };
  }
  return { user: { id: payload.userId, username: payload.username } };
};
