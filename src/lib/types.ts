export interface Thought {
  id: string;
  userId: string;
  title: string;
  content: string;
  url?: string;
  tags: string[];
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  stripeCustomerId?: string;
  subscriptionStatus?: 'active' | 'trialing' | 'canceled' | 'past_due' | 'inactive';
  subscriptionId?: string;
}

export interface SearchParams {
  query?: string;
  tags?: string[];
  from?: number;
  size?: number;
}
