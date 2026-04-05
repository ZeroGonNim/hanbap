import { z } from 'zod';

export const StatsSchema = z.object({
    lastUpdated: z.string(),
    today: z.object({
        total: z.number(),
        naver: z.number(),
        kakao: z.number(),
        google: z.number(),
    }),
    weeklyTrend: z.array(z.object({ date: z.string(), count: z.number() })),
    topKeywords: z.array(z.string()),
    aiCopy: z.object({
        lunch: z.string(),
        dinner: z.string(),
        sns: z.string(),
    }),
    totalAccumulated: z.number(),
    recentReviews: z.array(z.object({
        author: z.string(),
        platform: z.string(),
        rating: z.number(),
        content: z.string(),
        date: z.string(),
    })),
});

export const PromoSchema = z.object({
    lastUpdated: z.string(),
    postType: z.string(),
    itemName: z.string(),
    imageUrl: z.string(),
    caption: z.string(),
});

export type Stats = z.infer<typeof StatsSchema>;
export type PromoData = z.infer<typeof PromoSchema>;
