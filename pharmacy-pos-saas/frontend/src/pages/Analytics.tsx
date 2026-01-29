import React, { useState, useEffect } from 'react';
import { type AnalyticsStats } from '@/services/analytics';
import {
    MagnifyingGlassIcon,
    ChevronDownIcon,
    ChevronUpIcon
} from '@heroicons/react/24/outline';
import api from '@/services/api';

const Analytics: React.FC = () => {
    const [stats, setStats] = useState<AnalyticsStats | null>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [params, setParams] = useState({
        page: 1,
        limit: 10,
        search: '',
    });
    const [pagination, setPagination] = useState<any>(null);
    const [expandedRows, setExpandedRows] = useState<string[]>([]);

    useEffect(() => {
        fetchData();
    }, [params]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [statsRes, historyRes] = await Promise.all([
                api.get('/analytics/stats'),
                api.get('/analytics/history', { params })
            ]);

            // Stats response: { success, data: { today, month } }
            setStats(statsRes.data.data);

            // History response: { success, data: [...bills], pagination }
            setHistory(historyRes.data.data || []);
            setPagination(historyRes.data.pagination);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Sales Analytics</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Today's Sales */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">Today's Sales</h3>
                    <div className="mt-2 flex items-baseline">
                        <span className="text-3xl font-bold text-gray-900">
                            {stats ? formatCurrency(Number(stats.today.total)) : '...'}
                        </span>
                        <span className="ml-2 text-sm text-gray-500">
                            ({stats?.today.count || 0} bills)
                        </span>
                    </div>
                </div>

                {/* Monthly Sales */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">This Month's Sales</h3>
                    <div className="mt-2 flex items-baseline">
                        <span className="text-3xl font-bold text-gray-900">
                            {stats ? formatCurrency(Number(stats.month.total)) : '...'}
                        </span>
                        <span className="ml-2 text-sm text-gray-500">
                            ({stats?.month.count || 0} bills)
                        </span>
                    </div>
                </div>
            </div>

            {/* Bills Table Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>

                    {/* Search */}
                    <div className="relative w-full sm:w-72">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by Invoice ID or Customer..."
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            value={params.search}
                            onChange={(e) => setParams({ ...params, search: e.target.value, page: 1 })}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                                        Loading...
                                    </td>
                                </tr>
                            ) : history.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                                        No bills found.
                                    </td>
                                </tr>
                            ) : (
                                history.map((bill) => (
                                    <React.Fragment key={bill.id}>
                                        <tr
                                            className="hover:bg-gray-50 cursor-pointer transition-colors"
                                            onClick={() => setExpandedRows(prev =>
                                                prev.includes(bill.id)
                                                    ? prev.filter(id => id !== bill.id)
                                                    : [...prev, bill.id]
                                            )}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 flex items-center gap-2">
                                                {expandedRows.includes(bill.id) ? (
                                                    <ChevronUpIcon className="h-4 w-4 text-gray-400" />
                                                ) : (
                                                    <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                                                )}
                                                {bill.billNumber}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {bill.customer?.firstName || 'Guest'} {bill.customer?.lastName || ''}
                                                {bill.customer?.phone && <div className="text-xs text-gray-500">{bill.customer.phone}</div>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(bill.billedAt)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                {formatCurrency(bill.totalAmount)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${bill.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {bill.status}
                                                </span>
                                            </td>
                                        </tr>
                                        {expandedRows.includes(bill.id) && (
                                            <tr className="bg-gray-50">
                                                <td colSpan={5} className="px-6 py-4">
                                                    <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Items Purchased</div>
                                                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                                        <table className="min-w-full divide-y divide-gray-200">
                                                            <thead className="bg-gray-50">
                                                                <tr>
                                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                                                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                                                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-gray-200">
                                                                {bill.billItems && bill.billItems.length > 0 ? (
                                                                    bill.billItems.map((item: any) => (
                                                                        <tr key={item.id}>
                                                                            <td className="px-4 py-2 text-sm text-gray-900">{item.productName}</td>
                                                                            <td className="px-4 py-2 text-sm text-gray-500 text-right">{item.quantity}</td>
                                                                            <td className="px-4 py-2 text-sm text-gray-500 text-right">{formatCurrency(item.unitPrice)}</td>
                                                                            <td className="px-4 py-2 text-sm text-gray-900 text-right font-medium">{formatCurrency(item.totalAmount || (item.unitPrice * item.quantity))}</td>
                                                                        </tr>
                                                                    ))
                                                                ) : (
                                                                    <tr>
                                                                        <td colSpan={4} className="px-4 py-2 text-sm text-center text-gray-500 italic">No items found</td>
                                                                    </tr>
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination && (
                    <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between sm:px-6">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => setParams({ ...params, page: Math.max(1, params.page - 1) })}
                                disabled={params.page === 1}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setParams({ ...params, page: Math.min(pagination.totalPages, params.page + 1) })}
                                disabled={params.page === pagination.totalPages}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing page <span className="font-medium">{params.page}</span> of <span className="font-medium">{pagination.totalPages || 1}</span>
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button
                                        onClick={() => setParams({ ...params, page: Math.max(1, params.page - 1) })}
                                        disabled={params.page === 1}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setParams({ ...params, page: Math.min(pagination.totalPages || 1, params.page + 1) })}
                                        disabled={params.page === (pagination.totalPages || 1)}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Analytics;
