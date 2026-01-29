import React, { useEffect, useState } from 'react';
import {
    CurrencyRupeeIcon,
    ShoppingCartIcon,
    UsersIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import api from '@/services/api';
import { Link } from 'react-router-dom';
import AlertsModal from '@/components/common/AlertsModal';

const StatCard = ({ title, value, subtext, icon: Icon, color }: any) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-2">{value}</h3>
                </div>
                <div className={clsx("p-3 rounded-lg", color)}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
            </div>
            {subtext && <p className="mt-4 text-sm text-gray-500">{subtext}</p>}
        </div>
    );
};

const Dashboard: React.FC = () => {
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showAlerts, setShowAlerts] = useState(false);
    useEffect(() => {
        const abortController = new AbortController();
        let isMounted = true;

        const fetchData = async () => {
            try {
                // Short delay to ensure token propagation
                await new Promise(resolve => setTimeout(resolve, 500));

                // Fetch all dashboard data from single endpoint
                const response = await api.get('/dashboard', {
                    signal: abortController.signal
                });
                if (isMounted && response.data.success) {
                    setDashboardData(response.data.data);
                }
            } catch (err: any) {
                // Don't update state if request was aborted
                if (err.name === 'AbortError' || err.code === 'ERR_CANCELED') {
                    return;
                }
                if (isMounted) {
                    console.error("Failed to load dashboard data", err);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        // Check for alerts on first load
        const hasShownAlerts = sessionStorage.getItem('hasShownAlerts');
        if (!hasShownAlerts) {
            setShowAlerts(true);
            sessionStorage.setItem('hasShownAlerts', 'true');
        }

        // Cleanup function
        return () => {
            isMounted = false;
            abortController.abort();
        };
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const todaySales = dashboardData?.todaySales || { totalAmount: 0, totalBills: 0 };
    const monthlySummary = dashboardData?.monthlySummary || { totalAmount: 0, totalBills: 0 };
    const customers = dashboardData?.customers || { totalCustomers: 0 };
    const inventory = dashboardData?.inventory || { lowStockCount: 0 };
    const recentBills = dashboardData?.recentBills || [];

    return (
        <div className="space-y-6">
            <AlertsModal isOpen={showAlerts} onClose={() => setShowAlerts(false)} />
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500">Welcome back, here's what's happening at your store.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Today's Sales"
                    value={`₹${todaySales.totalAmount?.toLocaleString() || 0}`}
                    subtext={`${todaySales.totalBills || 0} bills today`}
                    icon={CurrencyRupeeIcon}
                    color="bg-blue-600"
                />
                <StatCard
                    title="Monthly Revenue"
                    value={`₹${monthlySummary.totalAmount?.toLocaleString() || 0}`}
                    subtext={`${monthlySummary.totalBills || 0} bills this month`}
                    icon={CurrencyRupeeIcon}
                    color="bg-indigo-600"
                />
                <StatCard
                    title="Total Customers"
                    value={customers.totalCustomers || 0}
                    subtext="Registered customers"
                    icon={UsersIcon}
                    color="bg-teal-600"
                />
                <StatCard
                    title="Low Stock Items"
                    value={inventory.lowStockCount || 0}
                    subtext="Items below reorder level"
                    icon={ExclamationTriangleIcon}
                    color="bg-red-600"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Col: Recent Bills */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                            <Link to="/analytics" className="text-sm font-medium text-blue-600 hover:text-blue-500">View All</Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bill No</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {recentBills.map((bill: any) => (
                                        <tr key={bill.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{bill.billNumber}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{bill.customerName || 'Walk-in'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(bill.billedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">₹{bill.totalAmount?.toLocaleString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bill.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {bill.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {recentBills.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No recent transactions</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Col: Shortcuts */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <div className="bg-blue-600 rounded-xl shadow-sm p-6 text-white">
                        <h3 className="text-lg font-bold mb-1">POS Billing</h3>
                        <p className="text-blue-100 text-sm mb-4">Start a new sale instantly</p>
                        <Link to="/pos" className="w-full bg-white text-blue-700 font-semibold py-2.5 rounded-lg shadow hover:bg-blue-50 transition p-2 flex justify-center items-center gap-2">
                            <ShoppingCartIcon className="h-5 w-5" />
                            New Bill
                        </Link>
                    </div>

                    {/* Low Stock Alert List (Mini) */}
                    {inventory.lowStockCount > 0 && (
                        <div className="bg-red-50 rounded-xl p-6 border border-red-100">
                            <div className="flex items-center mb-2">
                                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
                                <h3 className="text-red-900 font-medium">Attention Needed</h3>
                            </div>
                            <p className="text-red-700 text-sm">{inventory.lowStockCount} products are running low on stock. Check inventory.</p>
                            <Link to="/inventory?filter=low_stock" className="mt-3 block text-sm font-medium text-red-700 hover:text-red-800 underline">
                                Go to Inventory
                            </Link>
                        </div>
                    )}

                    {/* Expiring Soon Alert List (Mini) */}
                    {inventory.expiringCount > 0 && (
                        <div className="bg-orange-50 rounded-xl p-6 border border-orange-100">
                            <div className="flex items-center mb-2">
                                <ExclamationTriangleIcon className="h-5 w-5 text-orange-600 mr-2" />
                                <h3 className="text-orange-900 font-medium">Expiring Soon</h3>
                            </div>
                            <p className="text-orange-700 text-sm">{inventory.expiringCount} products are expiring within 30 days. Plan accordingly.</p>
                            <Link to="/inventory?filter=expiring_soon" className="mt-3 block text-sm font-medium text-orange-700 hover:text-orange-800 underline">
                                View Expiring Items
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
