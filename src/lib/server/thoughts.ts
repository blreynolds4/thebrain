import { esClient, THOUGHTS_INDEX } from './elasticsearch.js';
import type { Thought, SearchParams } from '../types.js';
import { randomUUID } from 'crypto';

export async function fetchThumbnail(url: string): Promise<string | undefined> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
    const html = await res.text();
    const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
                         html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    if (ogImageMatch) return ogImageMatch[1];
    const faviconMatch = html.match(/<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']/i);
    if (faviconMatch) {
      const favicon = faviconMatch[1];
      if (favicon.startsWith('http')) return favicon;
      const urlObj = new URL(url);
      return `${urlObj.origin}${favicon.startsWith('/') ? '' : '/'}${favicon}`;
    }
    const urlObj = new URL(url);
    return `${urlObj.origin}/favicon.ico`;
  } catch {
    return undefined;
  }
}

export async function createThought(userId: string, data: {
  title: string; content: string; url?: string; tags: string[];
}): Promise<Thought> {
  const id = randomUUID();
  const now = new Date().toISOString();
  let thumbnailUrl: string | undefined;
  if (data.url) thumbnailUrl = await fetchThumbnail(data.url);
  const thought: Omit<Thought, 'id'> = {
    userId, title: data.title, content: data.content,
    url: data.url || undefined, tags: data.tags,
    thumbnailUrl, createdAt: now, updatedAt: now
  };
  await esClient.index({ index: THOUGHTS_INDEX, id, document: thought, refresh: true });
  return { id, ...thought };
}

export async function updateThought(id: string, userId: string, data: {
  title: string; content: string; url?: string; tags: string[];
}): Promise<Thought | null> {
  const existing = await getThought(id, userId);
  if (!existing) return null;
  const now = new Date().toISOString();
  let thumbnailUrl = existing.thumbnailUrl;
  if (data.url !== existing.url) thumbnailUrl = data.url ? await fetchThumbnail(data.url) : undefined;
  const updated: Omit<Thought, 'id'> = {
    ...existing, ...data, url: data.url || undefined,
    thumbnailUrl, updatedAt: now
  };
  await esClient.index({ index: THOUGHTS_INDEX, id, document: updated, refresh: true });
  return { id, ...updated };
}

export async function deleteThought(id: string, userId: string): Promise<boolean> {
  const existing = await getThought(id, userId);
  if (!existing) return false;
  await esClient.delete({ index: THOUGHTS_INDEX, id, refresh: true });
  return true;
}

export async function getThought(id: string, userId: string): Promise<Thought | null> {
  try {
    const result = await esClient.get({ index: THOUGHTS_INDEX, id });
    const source = result._source as Omit<Thought, 'id'>;
    if (source.userId !== userId) return null;
    return { id: result._id, ...source };
  } catch {
    return null;
  }
}

export async function searchThoughts(userId: string, params: SearchParams): Promise<{ thoughts: Thought[]; total: number }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const must: any[] = [{ term: { userId } }];
  if (params.tags && params.tags.length > 0) {
    must.push({ terms: { tags: params.tags } });
  }
  const query = params.query?.trim();
  const esQuery = query
    ? {
        bool: {
          must,
          should: [
            { multi_match: { query, fields: ['title^2', 'content'], type: 'best_fields' as const } }
          ],
          minimum_should_match: 1
        }
      }
    : { bool: { must } };

  const result = await esClient.search({
    index: THOUGHTS_INDEX,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query: esQuery as any,
    sort: [{ updatedAt: { order: 'desc' as const } }],
    from: params.from || 0,
    size: params.size || 20
  });

  const thoughts = result.hits.hits.map(hit => ({
    id: hit._id as string,
    ...(hit._source as Omit<Thought, 'id'>)
  }));

  const total = typeof result.hits.total === 'number'
    ? result.hits.total
    : result.hits.total?.value || 0;

  return { thoughts, total };
}

export async function getAllTags(userId: string): Promise<string[]> {
  const result = await esClient.search({
    index: THOUGHTS_INDEX,
    query: { term: { userId } },
    size: 0,
    aggs: { tags: { terms: { field: 'tags', size: 100 } } }
  });
  const aggs = result.aggregations?.tags as { buckets: { key: string }[] } | undefined;
  return aggs?.buckets.map(b => b.key) || [];
}
