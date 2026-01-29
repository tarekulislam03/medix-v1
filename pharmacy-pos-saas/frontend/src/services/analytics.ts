import api from './api';

export interface AnalyticsStats {
    today: {
        total: number;
        count: number;
    };
    month: {
        total: number;
        count: number;
    };
}

export const getAnalyticsStats = async (): Promise<AnalyticsStats> => {
    const response = await api.get('/analytics/stats');
    return response.data.data;
};

export const getAnalyticsHistory = async (params: {
    page?: number;
    limit?: number;
    search?: string;
    startDate?: string;
    endDate?: string;
}) => {
    const response = await api.get('/analytics/history', { params });
    return response.data;
};

export default {
    getAnalyticsStats,
    getAnalyticsHistory,
};
