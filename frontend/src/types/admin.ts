// 타입은 Zod 스키마에서 파생 — schemas/admin.ts 참조
export { type Stats, type PromoData } from '../schemas/admin';

export type TabKey = 'overview' | 'marketing' | 'reviews';
export type Freshness = 'fresh' | 'stale' | 'dead';
