'use client';

import { createContext, useContext } from 'react';

export interface Recommendation {
  title:     string;
  author:    string;
  cover_url: string;
  reason:    string;
}

const RecsContext = createContext<Recommendation[] | null>(null);

export function useRecs() {
  const ctx = useContext(RecsContext);
  if (!ctx) {
    throw new Error('useRecs must be used within RecommendationsLayout');
  }
  return ctx;
}

export default RecsContext;