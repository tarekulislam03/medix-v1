import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, CalendarIcon, CurrencyRupeeIcon } from '@heroicons/react/24/outline';
import { type Customer, getCustomerHistory } from '@/services/customer';

interface CustomerHistoryModalProps {
    customer: Customer | null;
    isOpen: boolean;
    onClose: () => void;
}

const CustomerHistoryModal: React.FC<CustomerHistoryModalProps> = ({ customer, isOpen, onClose }) => {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState<any>(null);

    useEffect(() => {
        if (isOpen && customer) {
            fetchHistory();
        } else {
            setHistory([]);
            setPage(1);
        }
    }, [isOpen, customer, page]);

    const fetchHistory = async () => {
        if (!customer) return;
        setLoading(true);
        try {
            const data = await getCustomerHistory(customer.id, page);
            setHistory(data.data);
            setPagination(data.pagination);
        } catch (error) {
            console.error('Failed to fetch customer history', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="mx-auto max-w-2xl w-full rounded-xl bg-white shadow-lg overflow-hidden flex flex-col max-h-[80vh]">
                    <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50">
                        <div>
                            <Dialog.Title className="text-lg font-semibold text-gray-900">
                                Purchase History
                            </Dialog.Title>
                            <p className="text-sm text-gray-500">
                                {customer?.firstName} {customer?.lastName} • {customer?.phone}
                            </p>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        {loading ? (
                            <div className="text-center py-8 text-gray-500">Loading history...</div>
                        ) : history.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                No purchase history found for this customer.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {history.map((bill) => (
                                    <div key={bill.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center text-blue-600 font-medium text-sm">
                                                Invoice #{bill.billNumber}
                                            </div>
                                            <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${bill.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                bill.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {bill.status}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                                            <div className="flex items-center text-gray-600">
                                                <CalendarIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                                                {formatDate(bill.billedAt)}
                                            </div>
                                            <div className="flex items-center font-semibold text-gray-900 justify-end">
                                                <CurrencyRupeeIcon className="h-4 w-4 mr-1 text-gray-500" />
                                                {Number(bill.totalAmount).toFixed(2)}
                                            </div>
                                        </div>

                                        <div className="mt-4 border-t border-gray-100 pt-3">
                                            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Items Purchased</p>
                                            <div className="bg-gray-50 rounded-md p-3 space-y-2">
                                                {bill.billItems && bill.billItems.length > 0 ? (
                                                    bill.billItems.map((item: any) => (
                                                        <div key={item.id} className="flex justify-between text-xs">
                                                            <div>
                                                                <span className="font-medium text-gray-700">{item.productName}</span>
                                                                <span className="text-gray-500 ml-1">x {item.quantity}</span>
                                                            </div>
                                                            <div className="text-gray-600">
                                                                ₹{Number(item.totalPrice || (item.unitPrice * item.quantity)).toFixed(2)}
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-xs text-gray-400 italic">No items details available</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Simple Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span className="text-sm text-gray-600">
                                Page {page} of {pagination.totalPages}
                            </span>
                            <button
                                disabled={page === pagination.totalPages}
                                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};

export default CustomerHistoryModal;
