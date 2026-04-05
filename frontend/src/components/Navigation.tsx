import React from 'react';

import { STORE_INFO } from '../constants/storeInfo';

const Navigation: React.FC = () => {
    return (
        <nav className="fixed top-0 w-full z-50 bg-warm-beige/60 backdrop-blur-md border-b border-brand/5 px-6 py-4 flex justify-between items-center">
            <span className="font-sans text-2xl font-black text-brand tracking-widest drop-shadow-sm">{STORE_INFO.name}</span>
            <a href={`tel:${STORE_INFO.phone}`} className="bg-brand text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-brand/90 transition-all shadow-lg active:scale-95">
                전화예약
            </a>
        </nav>
    );
};

export default Navigation;
