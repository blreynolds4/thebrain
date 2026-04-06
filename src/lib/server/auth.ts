import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { esClient, USERS_INDEX } from './elasticsearch.js';
import type { User } from '../types.js';
import { randomUUID } from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || (() => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable must be set in production');
  }
  console.warn('[auth] Using default JWT secret — set JWT_SECRET in production');
  return 'dev-secret-please-change-in-production';
})();

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createToken(userId: string, username: string): string {
  return jwt.sign({ userId, username }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: string; username: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; username: string };
  } catch {
    return null;
  }
}

export async function getUserByUsername(username: string): Promise<User | null> {
  try {
    const result = await esClient.search({
      index: USERS_INDEX,
      query: { term: { username } }
    });
    const hits = result.hits.hits;
    if (hits.length === 0) return null;
    return { id: hits[0]._id as string, ...(hits[0]._source as Omit<User, 'id'>) };
  } catch {
    return null;
  }
}

export async function createUser(username: string, password: string): Promise<User> {
  const passwordHash = await hashPassword(password);
  const id = randomUUID();
  await esClient.index({
    index: USERS_INDEX,
    id,
    document: { username, passwordHash, subscriptionStatus: 'inactive' as const },
    refresh: true
  });
  return { id, username, passwordHash, subscriptionStatus: 'inactive' };
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const result = await esClient.get({ index: USERS_INDEX, id });
    return { id: result._id, ...(result._source as Omit<User, 'id'>) };
  } catch {
    return null;
  }
}

export async function updateUserSubscription(userId: string, updates: {
  stripeCustomerId?: string;
  subscriptionStatus?: User['subscriptionStatus'];
  subscriptionId?: string;
}): Promise<void> {
  await esClient.update({
    index: USERS_INDEX,
    id: userId,
    doc: updates,
    refresh: true
  });
}
