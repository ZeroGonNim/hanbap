export interface MenuItem {
    name: string;
    price: string;
    desc: string;
}

export interface MenuCategory {
    category: string;
    items: MenuItem[];
}

export interface Review {
    author: string;
    platform: 'Kakao' | 'Naver' | 'Google';
    rating: number;
    content: string;
    date: string;
}

export interface StoreInfo {
    name: string;
    phone: string;
    address: string;
    businessHours: string;
    breakTime: string;
    parking: string;
    shareText: string;
    marketingCopy: string;
    mapUrl: string;
    naverReviewUrl: string;
    kakaoReviewUrl: string;
    googleReviewUrl: string;
    instagramUrl: string;
}
