import React from 'react';
import { MapPin, Phone } from 'lucide-react';

import { STORE_INFO } from '../constants/storeInfo';

interface FooterProps {
    onShare: () => void;
}

const Footer = React.memo<FooterProps>(({ onShare }) => {
    return (
        <footer className="bg-brand py-6 px-6 text-warm-beige text-center">
            <div className="max-w-md mx-auto space-y-4">
                <div className="space-y-4">
                    <h3 className="font-serif text-2xl text-warm-beige font-bold tracking-widest uppercase">{STORE_INFO.name.replace(' ', '')}</h3>
                    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs leading-relaxed text-warm-beige/60">
                        <p className="flex items-center gap-1.5">
                            <MapPin size={12} className="shrink-0" />
                            <span>{STORE_INFO.address}</span>
                        </p>
                        <span className="hidden sm:inline text-warm-beige/30">|</span>
                        <a href={`tel:${STORE_INFO.phone}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
                            <Phone size={12} className="shrink-0" aria-hidden="true" />
                            <span>{STORE_INFO.phone}</span>
                        </a>
                    </div>
                </div>

                <p className="text-[10px] tracking-widest uppercase opacity-50 pt-2">
                    © 2026 Hanmaeum Restaurant. All rights reserved.
                </p>
            </div>
        </footer>
    );
});

Footer.displayName = 'Footer';
export default Footer;
