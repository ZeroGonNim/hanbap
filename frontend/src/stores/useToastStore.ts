import { create } from 'zustand';

interface ToastState {
    message: string;
    isVisible: boolean;
    showToast: (message: string) => void;
    hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
    message: '',
    isVisible: false,
    showToast: (message: string) => {
        set({ message, isVisible: true });
        // Automatically hide toast after 3 seconds
        setTimeout(() => {
            set({ isVisible: false });
        }, 3000);
    },
    hideToast: () => set({ isVisible: false }),
}));
