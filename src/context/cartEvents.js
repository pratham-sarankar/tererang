const CART_AUTH_EVENT = 'cart-auth-changed';

export const notifyCartAuthChange = () => {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new Event(CART_AUTH_EVENT));
};

export const subscribeCartAuthChange = (handler) => {
    if (typeof window === 'undefined') {
        return () => { };
    }

    window.addEventListener(CART_AUTH_EVENT, handler);
    return () => window.removeEventListener(CART_AUTH_EVENT, handler);
};
