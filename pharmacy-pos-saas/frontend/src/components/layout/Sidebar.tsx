import React, { Fragment } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom'; // Added useNavigate
import { Menu, Transition } from '@headlessui/react'; // Added Headless UI
import {
    HomeIcon,
    ShoppingBagIcon,
    UsersIcon,
    ClipboardDocumentListIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    QuestionMarkCircleIcon,
    ArrowLeftOnRectangleIcon,
    ChevronUpIcon, // Added
    Cog8ToothIcon // Added
} from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { useAuth } from '@/hooks/useAuth';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Inventory', href: '/inventory', icon: ClipboardDocumentListIcon },
    { name: 'POS / Billing', href: '/pos', icon: ShoppingBagIcon },
    { name: 'Customers', href: '/customers', icon: UsersIcon },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
    const { pathname } = useLocation();
    const navigate = useNavigate(); // Hook for navigation
    const { logout, user } = useAuth();

    return (
        <>
            {/* Mobile backdrop */}
            <div
                className={clsx(
                    'fixed inset-0 z-20 bg-gray-900/50 transition-opacity lg:hidden',
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                )}
                onClick={() => setIsOpen(false)}
            />

            {/* Sidebar component */}
            <div
                className={clsx(
                    'fixed inset-y-0 left-0 z-30 w-64 transform bg-white shadow-xl transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-auto lg:shadow-none border-r border-gray-200',
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <div className="flex h-full flex-col">
                    {/* Logo */}
                    <div className="flex h-16 items-center px-6 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xl">
                                M
                            </div>
                            <span className="text-xl font-bold text-gray-900">MediX</span>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
                            Menu
                        </div>
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <NavLink
                                    key={item.name}
                                    to={item.href}
                                    className={({ isActive }) =>
                                        clsx(
                                            'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                                            isActive
                                                ? 'bg-blue-50 text-blue-700'
                                                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                        )
                                    }
                                >
                                    <item.icon
                                        className={clsx(
                                            'mr-3 h-5 w-5 flex-shrink-0',
                                            isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                                        )}
                                        aria-hidden="true"
                                    />
                                    {item.name}
                                </NavLink>
                            );
                        })}

                        <div className="mt-8 text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
                            Support
                        </div>
                        <NavLink
                            to="/help"
                            className={({ isActive }) =>
                                clsx(
                                    'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                                    isActive
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                )
                            }
                        >
                            <QuestionMarkCircleIcon
                                className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                                aria-hidden="true"
                            />
                            Help & Support
                        </NavLink>
                    </nav>

                    {/* User Profile Dropdown (Bottom Left) */}
                    <div className="border-t border-gray-200 p-4">
                        <Menu as="div" className="relative">
                            <Menu.Button className="flex w-full items-center justify-between rounded-lg p-2 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1">
                                <div className="flex items-center">
                                    <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold border border-indigo-200">
                                        {user?.firstName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                    <div className="ml-3 text-left">
                                        <p className="text-sm font-medium text-gray-700 truncate max-w-[120px]">
                                            {user?.firstName || user?.email?.split('@')[0] || 'User'}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate max-w-[120px]">
                                            {user?.storeName || 'MediX Store'}
                                        </p>
                                    </div>
                                </div>
                                <ChevronUpIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                            </Menu.Button>

                            <Transition
                                as={Fragment}
                                enter="transition ease-out duration-100"
                                enterFrom="transform opacity-0 scale-95 translate-y-2"
                                enterTo="transform opacity-100 scale-100 translate-y-0"
                                leave="transition ease-in duration-75"
                                leaveFrom="transform opacity-100 scale-100 translate-y-0"
                                leaveTo="transform opacity-0 scale-95 translate-y-2"
                            >
                                <Menu.Items className="absolute bottom-full left-0 mb-2 w-full origin-bottom-left rounded-lg bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-gray-100 overflow-hidden z-50">
                                    <div className="px-1 py-1">
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    onClick={() => navigate('/settings')}
                                                    className={clsx(
                                                        active ? 'bg-blue-600 text-white' : 'text-gray-700',
                                                        'group flex w-full items-center rounded-md px-2 py-2 text-sm transition-colors'
                                                    )}
                                                >
                                                    <Cog8ToothIcon className={clsx("mr-2 h-4 w-4", active ? 'text-white' : 'text-gray-400')} aria-hidden="true" />
                                                    User Settings
                                                </button>
                                            )}
                                        </Menu.Item>

                                    </div>
                                    <div className="px-1 py-1">
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    onClick={logout}
                                                    className={clsx(
                                                        active ? 'bg-red-600 text-white' : 'text-gray-700',
                                                        'group flex w-full items-center rounded-md px-2 py-2 text-sm transition-colors'
                                                    )}
                                                >
                                                    <ArrowLeftOnRectangleIcon className={clsx("mr-2 h-4 w-4", active ? 'text-white' : 'text-gray-400')} aria-hidden="true" />
                                                    Logout
                                                </button>
                                            )}
                                        </Menu.Item>
                                    </div>
                                </Menu.Items>
                            </Transition>
                        </Menu>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
