import { apiUrl } from '../config/env.js';

const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

const authedFetch = async (endpoint, options = {}) => {
    const token = getToken();
    if (!token) {
        throw new Error('Please log in to manage addresses');
    }

    const response = await fetch(apiUrl(endpoint), {
        method: 'GET',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            ...(options.headers || {}),
        },
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Address request failed');
    }
    return data;
};

export const listAddresses = async () => {
    const data = await authedFetch('/api/addresses');
    return data.addresses || [];
};

export const createAddress = async (payload) => {
    const data = await authedFetch('/api/addresses', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
    return data.addresses || [];
};

export const updateAddress = async (id, payload) => {
    const data = await authedFetch(`/api/addresses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
    return data.addresses || [];
};

export const deleteAddress = async (id) => {
    const data = await authedFetch(`/api/addresses/${id}`, {
        method: 'DELETE',
    });
    return data.addresses || [];
};

export const setDefaultAddress = async (id) => {
    const data = await authedFetch(`/api/addresses/${id}/default`, {
        method: 'PATCH',
    });
    return data.addresses || [];
};
