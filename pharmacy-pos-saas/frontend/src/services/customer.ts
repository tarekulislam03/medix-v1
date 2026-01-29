import api from './api';

export interface Customer {
    id: string;
    firstName: string;
    lastName?: string;
    phone: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    loyaltyPoints: number;
    totalPurchases: string | number;
    updatedAt: string;
    createdAt: string;
}

export interface CreateCustomerInput {
    firstName: string;
    lastName?: string;
    phone: string;
    email?: string;
    address?: string;
}

export const searchCustomers = async (query: string) => {
    const response = await api.get('/customers/search', { params: { q: query } });
    return response.data;
};

export const createCustomer = async (data: CreateCustomerInput) => {
    const response = await api.post('/customers', data);
    return response.data;
};

export const getCustomerHistory = async (id: string, page = 1, limit = 10) => {
    const response = await api.get(`/customers/${id}/bills`, { params: { page, limit } });
    return response.data;
};

export const getCustomers = async (page = 1, limit = 10, search = '') => {
    const response = await api.get('/customers/search', { params: { q: search || undefined, page, limit } });
    return response.data;
};

export const updateCustomer = async (id: string, data: Partial<CreateCustomerInput>) => {
    const response = await api.put(`/customers/${id}`, data);
    return response.data;
};

export const deleteCustomer = async (id: string) => {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
};

export default {
    searchCustomers,
    createCustomer,
    getCustomerHistory,
    getCustomers,
    updateCustomer,
    deleteCustomer,
};
