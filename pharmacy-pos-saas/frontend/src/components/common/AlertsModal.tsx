import React, { useEffect, useState } from 'react';
import { XMarkIcon, ExclamationTriangleIcon, ClockIcon } from '@heroicons/react/24/outline';
import api from '@/services/api';
import { useNavigate } from 'react-router-dom';

interface Product {
    id: string;
    name: string;
    quantity: number;
    expiryDate?: string;
    minStockLevel: number;
    unit: string;
}

interface AlertsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AlertsModal: React.FC<AlertsModalProps> = ({ isOpen, onClose }) => {
    const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
    const [expiringProducts, setExpiringProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen) {
            fetchAlerts();
        }
    }, [isOpen]);

    const fetchAlerts = async () => {
        try {
            setLoading(true);
            const [lowStockRes, expiringRes] = await Promise.all([
                api.get('/products?lowStock=true&limit=5'),
                api.get('/products?expiring=true&limit=5')
            ]);

            const lowStock = lowStockRes.data.success ? lowStockRes.data.data : [];
            const expiring = expiringRes.data.success ? expiringRes.data.data : [];

            setLowStockProducts(lowStock);
            setExpiringProducts(expiring);

            // Auto-close if no alerts found
            if (lowStock.length === 0 && expiring.length === 0) {
                onClose();
            }
        } catch (error) {
            console.error('Failed to fetch alerts', error);
            onClose();
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    // If loading, show nothing or spinner. If result empty (handled above), show nothing.
    // We only render if there's data or loading.
    if (!loading && lowStockProducts.length === 0 && expiringProducts.length === 0) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

                {/* Modal panel */}
                <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                    {loading ? (
                        <div className="p-8 flex justify-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <div>
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="text-lg leading-6 font-bold text-gray-900 flex items-center gap-2">
                                    <ExclamationTriangleIcon className="h-6 w-6 text-amber-500" />
                                    Inventory Alerts
                                </h3>
                                <button
                                    onClick={onClose}
                                    type="button"
                                    className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                                >
                                    <span className="sr-only">Close</span>
                                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                </button>
                            </div>

                            <div className="px-6 py-6 space-y-8 max-h-[70vh] overflow-y-auto">
                                {/* Low Stock Section */}
                                {lowStockProducts.length > 0 && (
                                    <div>
                                        <h4 className="flex items-center text-red-600 font-semibold mb-3">
                                            <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                                            Low Stock Items
                                        </h4>
                                        <div className="bg-red-50 rounded-xl border border-red-100 overflow-hidden">
                                            <ul className="divide-y divide-red-100">
                                                {lowStockProducts.map(product => (
                                                    <li key={product.id} className="px-4 py-3 flex justify-between items-center hover:bg-red-100/50 transition-colors">
                                                        <div>
                                                            <p className="font-medium text-gray-900">{product.name}</p>
                                                            <p className="text-xs text-red-600 font-medium">
                                                                Current: {product.quantity} {product.unit} (Min: {product.minStockLevel})
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={() => { onClose(); navigate(`/inventory?search=${product.name}`); }}
                                                            className="text-xs bg-white border border-red-200 text-red-700 px-3 py-1 rounded-lg hover:bg-red-50"
                                                        >
                                                            Restock
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}

                                {/* Expiry Section */}
                                {expiringProducts.length > 0 && (
                                    <div>
                                        <h4 className="flex items-center text-amber-600 font-semibold mb-3">
                                            <ClockIcon className="h-5 w-5 mr-2" />
                                            Expiring Soon (Next 30 Days)
                                        </h4>
                                        <div className="bg-amber-50 rounded-xl border border-amber-100 overflow-hidden">
                                            <ul className="divide-y divide-amber-100">
                                                {expiringProducts.map(product => {
                                                    const daysLeft = product.expiryDate
                                                        ? Math.ceil((new Date(product.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
                                                        : 0;

                                                    return (
                                                        <li key={product.id} className="px-4 py-3 flex justify-between items-center hover:bg-amber-100/50 transition-colors">
                                                            <div>
                                                                <p className="font-medium text-gray-900">{product.name}</p>
                                                                <p className="text-xs text-amber-700 font-medium">
                                                                    Expires in {daysLeft} days ({new Date(product.expiryDate!).toLocaleDateString()})
                                                                </p>
                                                            </div>
                                                            <button
                                                                onClick={() => { onClose(); navigate(`/inventory?search=${product.name}`); }}
                                                                className="text-xs bg-white border border-amber-200 text-amber-700 px-3 py-1 rounded-lg hover:bg-amber-50"
                                                            >
                                                                View
                                                            </button>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="bg-gray-50 px-6 py-4 flex justify-end">
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:w-auto sm:text-sm"
                                    onClick={onClose}
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AlertsModal;
