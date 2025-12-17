import { useState, useCallback } from 'react';

const RAZORPAY_SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

export const useRazorpay = () => {
    const [isLoaded, setIsLoaded] = useState(false);

    const loadRazorpay = useCallback(() => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                setIsLoaded(true);
                resolve(true);
                return;
            }

            const script = document.createElement('script');
            script.src = RAZORPAY_SCRIPT_SRC;
            script.onload = () => {
                setIsLoaded(true);
                resolve(true);
            };
            script.onerror = () => {
                setIsLoaded(false);
                resolve(false);
            };
            document.body.appendChild(script);
        });
    }, []);

    return { isLoaded, loadRazorpay };
};
