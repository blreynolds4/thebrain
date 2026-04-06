import { Client } from '@elastic/elasticsearch';

const ELASTICSEARCH_URL = process.env.ELASTICSEARCH_URL || 'http://localhost:9200';

export const esClient = new Client({
  node: ELASTICSEARCH_URL
});

export const THOUGHTS_INDEX = 'thoughts';
export const USERS_INDEX = 'users';

export async function ensureIndices() {
  const thoughtsExists = await esClient.indices.exists({ index: THOUGHTS_INDEX });
  if (!thoughtsExists) {
    await esClient.indices.create({
      index: THOUGHTS_INDEX,
      mappings: {
        properties: {
          userId: { type: 'keyword' },
          title: { type: 'text', analyzer: 'standard' },
          content: { type: 'text', analyzer: 'standard' },
          url: { type: 'keyword' },
          tags: { type: 'keyword' },
          thumbnailUrl: { type: 'keyword' },
          createdAt: { type: 'date' },
          updatedAt: { type: 'date' }
        }
      }
    });
  }

  const usersExists = await esClient.indices.exists({ index: USERS_INDEX });
  if (!usersExists) {
    await esClient.indices.create({
      index: USERS_INDEX,
      mappings: {
        properties: {
          username: { type: 'keyword' },
          passwordHash: { type: 'keyword' },
          stripeCustomerId: { type: 'keyword' },
          subscriptionStatus: { type: 'keyword' },
          subscriptionId: { type: 'keyword' }
        }
      }
    });
  }
}
