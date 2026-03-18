import { z } from 'zod';

export const ReviewSchema = z.object({
  platform: z.enum(['naver', 'kakao', 'blog', 'google']),
  author: z.string(),
  rating: z.number().min(0).max(5),
  content: z.string(),
  date: z.string(),
  images: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
});

export type Review = z.infer<typeof ReviewSchema>;

export const ScrapedDataSchema = z.object({
  restaurantName: z.string(),
  collectedAt: z.string(),
  reviews: z.array(ReviewSchema),
});

export type ScrapedData = z.infer<typeof ScrapedDataSchema>;
