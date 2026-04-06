import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { searchThoughts, createThought, updateThought, deleteThought, getAllTags } from '$lib/server/thoughts';
import { thoughtSchema } from '$lib/schemas';
import { verifyToken } from '$lib/server/auth';

export const load: PageServerLoad = async ({ url, cookies }) => {
  const token = cookies.get('auth_token');
  const payload = token ? verifyToken(token) : null;
  if (!payload) throw redirect(302, '/login');

  const query = url.searchParams.get('q') || '';
  const tagsParam = url.searchParams.get('tags') || '';
  const tags = tagsParam ? tagsParam.split(',').filter(Boolean) : [];

  const [{ thoughts, total }, allTags] = await Promise.all([
    searchThoughts(payload.userId, { query, tags }),
    getAllTags(payload.userId)
  ]);

  return { thoughts, total, allTags, query, selectedTags: tags };
};

export const actions: Actions = {
  create: async ({ request, cookies }) => {
    const token = cookies.get('auth_token');
    const payload = token ? verifyToken(token) : null;
    if (!payload) throw redirect(302, '/login');

    const formData = Object.fromEntries(await request.formData());
    const tagsRaw = (formData.tags as string) || '';
    const tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean);
    const parsed = thoughtSchema.safeParse({ ...formData, tags });
    if (!parsed.success) {
      return fail(400, { error: parsed.error.errors[0].message, action: 'create' });
    }
    await createThought(payload.userId, parsed.data);
    return { success: true, action: 'create' };
  },

  update: async ({ request, cookies }) => {
    const token = cookies.get('auth_token');
    const payload = token ? verifyToken(token) : null;
    if (!payload) throw redirect(302, '/login');

    const formData = Object.fromEntries(await request.formData());
    const id = formData.id as string;
    if (!id) return fail(400, { error: 'Missing thought ID', action: 'update' });

    const tagsRaw = (formData.tags as string) || '';
    const tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean);
    const parsed = thoughtSchema.safeParse({ ...formData, tags });
    if (!parsed.success) {
      return fail(400, { error: parsed.error.errors[0].message, action: 'update' });
    }
    const result = await updateThought(id, payload.userId, parsed.data);
    if (!result) return fail(404, { error: 'Thought not found', action: 'update' });
    return { success: true, action: 'update' };
  },

  delete: async ({ request, cookies }) => {
    const token = cookies.get('auth_token');
    const payload = token ? verifyToken(token) : null;
    if (!payload) throw redirect(302, '/login');

    const formData = Object.fromEntries(await request.formData());
    const id = formData.id as string;
    if (!id) return fail(400, { error: 'Missing thought ID', action: 'delete' });

    const deleted = await deleteThought(id, payload.userId);
    if (!deleted) return fail(404, { error: 'Thought not found', action: 'delete' });
    return { success: true, action: 'delete' };
  }
};
