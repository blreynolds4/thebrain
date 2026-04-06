import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getUserByUsername, verifyPassword, createToken, createUser, verifyToken } from '$lib/server/auth';
import { loginSchema, registerSchema } from '$lib/schemas';

const SECURE_COOKIE = process.env.NODE_ENV === 'production';

export const load: PageServerLoad = async ({ cookies }) => {
  const token = cookies.get('auth_token');
  if (token && verifyToken(token)) throw redirect(302, '/');
  return {};
};

export const actions: Actions = {
  login: async ({ request, cookies }) => {
    const formData = Object.fromEntries(await request.formData());
    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      return fail(400, { error: result.error.errors[0].message, action: 'login' });
    }
    const { username, password } = result.data;
    const user = await getUserByUsername(username);
    if (!user) {
      return fail(401, { error: 'Invalid username or password', action: 'login' });
    }
    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return fail(401, { error: 'Invalid username or password', action: 'login' });
    }
    const token = createToken(user.id, user.username);
    cookies.set('auth_token', token, {
      path: '/',
      httpOnly: true,
      secure: SECURE_COOKIE,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    });
    throw redirect(302, '/');
  },

  register: async ({ request, cookies }) => {
    const formData = Object.fromEntries(await request.formData());
    const result = registerSchema.safeParse(formData);
    if (!result.success) {
      return fail(400, { error: result.error.errors[0].message, action: 'register' });
    }
    const { username, password } = result.data;
    const existing = await getUserByUsername(username);
    if (existing) {
      return fail(409, { error: 'Username already taken', action: 'register' });
    }
    const user = await createUser(username, password);
    const token = createToken(user.id, user.username);
    cookies.set('auth_token', token, {
      path: '/',
      httpOnly: true,
      secure: SECURE_COOKIE,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    });
    throw redirect(302, '/');
  }
};
