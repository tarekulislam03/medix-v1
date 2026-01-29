import React, { Fragment, useEffect, useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import {
    Bars3Icon,
    BellIcon,
    MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import api from '@/services/api';

interface TopbarProps {
    onMenuClick: () => void;
}

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    status: string;
    createdAt: string;
}

const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const abortController = new AbortController();
        let isMounted = true;

        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch both notifications and inventory stats in parallel
                const [notifResponse, inventoryResponse] = await Promise.all([
                    api.get('/notifications', {
                        params: { limit: 5 },
                        signal: abortController.signal
                    }),
                    api.get('/dashboard/inventory-stats', {
                        signal: abortController.signal
                    })
                ]);

                if (isMounted) {
                    let fetchedNotifications: Notification[] = notifResponse.data.data || [];
                    const inventoryStats = inventoryResponse.data.data;

                    // Manually inject system alerts if not present
                    // (We filter existing ones by title to avoid duplication if backend generated them)

                    if (inventoryStats.lowStockCount > 0) {
                        const hasLowStockNotif = fetchedNotifications.some(n => n.title === 'Low Stock Alert');
                        if (!hasLowStockNotif) {
                            fetchedNotifications.unshift({
                                id: 'sys-low-stock',
                                title: 'Low Stock Alert',
                                message: `${inventoryStats.lowStockCount} items are running low on stock.`,
                                type: 'ALERT',
                                status: 'UNREAD',
                                createdAt: new Date().toISOString()
                            });
                        }
                    }

                    if (inventoryStats.expiringCount > 0) {
                        const hasExpiryNotif = fetchedNotifications.some(n => n.title === 'Expiring Soon');
                        if (!hasExpiryNotif) {
                            fetchedNotifications.unshift({
                                id: 'sys-expiry',
                                title: 'Expiring Soon',
                                message: `${inventoryStats.expiringCount} items are expiring within 30 days.`,
                                type: 'WARNING',
                                status: 'UNREAD',
                                createdAt: new Date().toISOString()
                            });
                        }
                    }

                    setNotifications(fetchedNotifications);
                }
            } catch (error: any) {
                // Don't log aborted requests
                if (error.name !== 'AbortError' && error.code !== 'ERR_CANCELED') {
                    // Silent fail or minimal log
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
            abortController.abort();
        };
    }, []);

    const unreadCount = notifications.filter((n) => n.status === 'UNREAD').length;

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hr ago`;
        return `${diffDays} days ago`;
    };

    const markAsRead = async (id: string) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'READ' } : n));
        } catch (error) {
            console.error('Failed to mark as read', error);
        }
    };

    return (
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10 w-full">
            {/* Left section: Menu button & Search */}
            <div className="flex items-center gap-4 flex-1">
                <button
                    type="button"
                    className="text-gray-500 hover:text-gray-700 focus:outline-none lg:hidden -ml-2 p-2 rounded-md hover:bg-gray-100"
                    onClick={onMenuClick}
                >
                    <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                </button>

                <div className="relative w-full max-w-md hidden md:block">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                        placeholder="Search for medicines, customers, or bills..."
                    />
                </div>
            </div>

            {/* Right section: Notifications */}
            <div className="flex items-center gap-3">
                {/* Notification Dropdown */}
                <Menu as="div" className="relative">
                    <Menu.Button className="relative p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full focus:outline-none transition-colors">
                        <span className="sr-only">View notifications</span>
                        <BellIcon className="h-6 w-6" aria-hidden="true" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                        )}
                    </Menu.Button>
                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                    >
                        <Menu.Items className="absolute right-0 mt-2 w-80 origin-top-right bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-gray-100 z-50">
                            <div className="px-4 py-3 flex justify-between items-center">
                                <p className="text-sm font-semibold text-gray-900">Notifications</p>
                                {unreadCount > 0 && (
                                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                        {unreadCount} New
                                    </span>
                                )}
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {loading ? (
                                    <div className="px-4 py-6 text-center text-sm text-gray-500">
                                        Loading...
                                    </div>
                                ) : notifications.length > 0 ? (
                                    notifications.map((notification) => (
                                        <Menu.Item key={notification.id}>
                                            {({ active }) => (
                                                <div
                                                    onClick={() => markAsRead(notification.id)}
                                                    className={clsx(
                                                        active ? 'bg-gray-50' : '',
                                                        'px-4 py-3 cursor-pointer'
                                                    )}
                                                >
                                                    <div className="flex justify-between">
                                                        <p className={clsx("text-sm font-medium", notification.status === 'UNREAD' ? "text-gray-900" : "text-gray-600")}>
                                                            {notification.title}
                                                        </p>
                                                        {notification.status === 'UNREAD' && (
                                                            <span className="h-2 w-2 rounded-full bg-blue-600 mt-1.5 flex-shrink-0"></span>
                                                        )}
                                                    </div>
                                                    <p className="mt-1 text-xs text-gray-500">{formatTime(notification.createdAt)}</p>
                                                </div>
                                            )}
                                        </Menu.Item>
                                    ))
                                ) : (
                                    <div className="px-4 py-6 text-center text-sm text-gray-500">
                                        No notifications
                                    </div>
                                )}
                            </div>
                            <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 rounded-b-lg">
                                <a href="/notifications" className="block text-center text-xs font-medium text-blue-600 hover:text-blue-500">
                                    View all notifications
                                </a>
                            </div>
                        </Menu.Items>
                    </Transition>
                </Menu>
            </div>
        </header >
    );
};

export default Topbar;
