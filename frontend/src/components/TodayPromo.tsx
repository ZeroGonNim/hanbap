import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface PromoData {
  itemName: string;
  imageUrl: string;
  caption: string;
  lastUpdated: string;
}

const TodayPromo = () => {
  const [promo, setPromo] = useState<PromoData | null>(null);

  useEffect(() => {
    fetch('/data/today_promo.json')
      .then(res => res.json())
      .then(data => setPromo(data))
      .catch(() => { /* 오늘의 메뉴 데이터 없음 — 섹션 숨김 처리됨 */ });
  }, []);

  if (!promo) return null;

  return (
    <div className="px-6 py-20">
      <div className="text-center mb-12">
        <span className="text-hb-red font-bold text-xs tracking-wide-editorial uppercase mb-2 block">Recommendation of the Day</span>
        <h3 className="text-3xl font-black">오늘, 사장님의 선택</h3>
      </div>

      <div className="relative group max-w-2xl mx-auto">
        {/* Double Bezel Architecture */}
        <div className="bg-hb-brown/5 ring-1 ring-hb-brown/5 p-2 rounded-[2.5rem] shadow-premium">
          <div className="bg-white rounded-[calc(2.5rem-0.5rem)] overflow-hidden shadow-inner-light border border-hb-border">
            
            {/* Visual Part */}
            <div className="relative h-[450px] overflow-hidden">
              <motion.img
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                src={promo.imageUrl || 'https://lh3.googleusercontent.com/d/15sIvSOnbuX3jTwibMgBAKRCGZ7ZKEfzC'}
                alt={promo.itemName}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-hb-brown/60 via-transparent to-transparent" />
              
              {/* Floating Menu Name (Vertical) */}
              <div className="absolute top-10 right-10 bg-hb-red text-white py-8 px-4 font-black text-xl [writing-mode:vertical-rl] tracking-[0.2em] shadow-lg">
                今日推荐: {promo.itemName}
              </div>

              {/* Price / Subtext overlay */}
              <div className="absolute bottom-10 left-10 text-white">
                <span className="text-xs font-bold tracking-widest uppercase opacity-80 mb-2 block">Special Recommendation</span>
                <h4 className="text-4xl font-black tracking-tighter">{promo.itemName}</h4>
              </div>
            </div>

            {/* Content Part */}
            <div className="p-10 text-center md:text-left md:flex justify-between items-end gap-10">
              <div className="flex-1">
                <p className="text-hb-muted leading-relaxed text-lg break-keep-all font-serif-kr italic mb-6 md:mb-0">
                  {promo.caption.split('\n\n')[2]?.replace('💬 ', '') || "사장님이 직접 고른 오늘의 신선한 재료로 준비한 일품 요리입니다."}
                </p>
              </div>
              
              <div className="shrink-0">
                <div className="text-hb-red font-black text-3xl mb-1">
                  ₩{promo.caption.match(/₩[\d,]+/)?.[0].replace('₩', '') || '시가'}
                </div>
                <div className="text-hb-muted text-[0.65rem] font-bold tracking-widest uppercase">
                  Authentic Taste since 1990
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TodayPromo;
