import React, { useState, useEffect } from 'react';
import { UserCircleIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Combobox } from '@headlessui/react';
import { clsx } from 'clsx';
import api from '@/services/api';
import type { Customer } from '@/types';

interface CustomerSelectProps {
    selectedCustomer: Customer | null;
    onSelectCustomer: (customer: Customer | null) => void;
    onAddNew?: () => void;
}

const CustomerSelect: React.FC<CustomerSelectProps> = ({ selectedCustomer, onSelectCustomer, onAddNew }) => {
    const [query, setQuery] = useState('');
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // If query is empty, maybe don't search or search default recent? 
        // Let's search only on type.
        if (query.length < 2) {
            setCustomers([]);
            return;
        }

        const timer = setTimeout(() => {
            setLoading(true);
            api.get(`/customers/search?q=${query}`)
                .then(res => setCustomers(res.data.data))
                .catch(console.error)
                .finally(() => setLoading(false));
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    return (
        <div className="w-full">
            <Combobox value={selectedCustomer} onChange={onSelectCustomer} nullable>
                <div className="relative mt-1">
                    <div className="relative w-full cursor-default overflow-hidden rounded-xl bg-white text-left shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-300 sm:text-sm border border-gray-300">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <UserCircleIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <Combobox.Input
                            className="w-full border-none py-3 pl-10 pr-10 text-sm leading-5 text-gray-900 focus:ring-0 outline-none"
                            displayValue={(customer: Customer) => customer ? `${customer.firstName} ${customer.lastName || ''} (${customer.phone})` : ''}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search Customer (Name or Phone)..."
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                            {onAddNew && (
                                <button
                                    onClick={(e) => { e.preventDefault(); onAddNew(); }}
                                    className="p-1 rounded-full text-blue-600 hover:bg-blue-50"
                                    title="Add New Customer"
                                >
                                    <PlusIcon className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                    </div>

                    <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-40">
                        {customers.length === 0 && query.length >= 2 && !loading ? (
                            <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                                No customer found.
                            </div>
                        ) : (
                            customers.map((customer) => (
                                <Combobox.Option
                                    key={customer.id}
                                    className={({ active }) =>
                                        clsx(
                                            'relative cursor-default select-none py-2 pl-4 pr-4',
                                            active ? 'bg-blue-600 text-white' : 'text-gray-900'
                                        )
                                    }
                                    value={customer}
                                >
                                    {({ selected, active }) => (
                                        <div className="flex flex-col">
                                            <span className={clsx("block truncate font-medium", selected ? 'font-bold' : 'font-normal')}>
                                                {customer.firstName} {customer.lastName}
                                            </span>
                                            <span className={clsx("text-xs truncate", active ? 'text-blue-200' : 'text-gray-500')}>
                                                {customer.phone} {customer.city ? `| ${customer.city}` : ''}
                                            </span>
                                        </div>
                                    )}
                                </Combobox.Option>
                            ))
                        )}
                        {loading && (
                            <div className="relative cursor-default select-none py-2 px-4 text-gray-700">Loading...</div>
                        )}
                    </Combobox.Options>
                </div>
            </Combobox>
        </div>
    );
};

export default CustomerSelect;
