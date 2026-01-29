import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import api from '@/services/api';
import type { Product } from '@/types';

interface EditProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    product: Product | null;
}

const EditProductModal: React.FC<EditProductModalProps> = ({ isOpen, onClose, onSuccess, product }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        genericName: '',
        manufacturer: '',
        category: 'GENERAL',
        dosageForm: 'TABLET',
        strength: '',
        unit: 'PCS',
        costPrice: '',
        sellingPrice: '',
        mrp: '',
        quantity: '',
        minStockLevel: '10',
        reorderLevel: '20',
        batchNumber: '',
        expiryDate: '',
        prescription: false,
        description: '',
    });

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                genericName: product.genericName || '',
                manufacturer: product.manufacturer || '',
                category: product.category || 'GENERAL',
                dosageForm: product.dosageForm || 'TABLET',
                strength: product.strength || '',
                unit: product.unit || 'PCS',
                costPrice: product.costPrice?.toString() || '',
                sellingPrice: product.sellingPrice?.toString() || '',
                mrp: product.mrp?.toString() || '',
                quantity: product.quantity?.toString() || '',
                minStockLevel: product.minStockLevel?.toString() || '10',
                reorderLevel: product.reorderLevel?.toString() || '20',
                batchNumber: product.batchNumber || '',
                expiryDate: product.expiryDate ? new Date(product.expiryDate).toISOString().split('T')[0] : '',
                prescription: product.prescription || false,
                description: product.description || '',
            });
        }
    }, [product]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!product) return;

        setLoading(true);
        setError('');

        try {
            await api.put(`/products/${product.id}`, {
                ...formData,
                costPrice: parseFloat(formData.costPrice) || 0,
                sellingPrice: parseFloat(formData.sellingPrice) || 0,
                mrp: parseFloat(formData.mrp) || 0,
                quantity: parseInt(formData.quantity) || 0,
                minStockLevel: parseInt(formData.minStockLevel) || 10,
                reorderLevel: parseInt(formData.reorderLevel) || 20,
                expiryDate: formData.expiryDate || null,
            });

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Transition show={isOpen} as={React.Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={React.Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <Transition.Child
                            as={React.Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
                                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                                    <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900">
                                        Edit Product
                                    </Dialog.Title>
                                    <button
                                        type="button"
                                        className="rounded-md text-gray-400 hover:text-gray-500"
                                        onClick={onClose}
                                    >
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="px-6 py-4 max-h-[70vh] overflow-y-auto">
                                    {error && (
                                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                                            {error}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Name */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                                            <input
                                                type="text"
                                                name="name"
                                                required
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>

                                        {/* Generic Name */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Generic Name</label>
                                            <input
                                                type="text"
                                                name="genericName"
                                                value={formData.genericName}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>

                                        {/* Manufacturer */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
                                            <input
                                                type="text"
                                                name="manufacturer"
                                                value={formData.manufacturer}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>

                                        {/* Category */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                            <select
                                                name="category"
                                                value={formData.category}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="GENERAL">General</option>
                                                <option value="PRESCRIPTION">Prescription</option>
                                                <option value="OTC">OTC</option>
                                                <option value="COSMETIC">Cosmetic</option>
                                                <option value="AYURVEDIC">Ayurvedic</option>
                                                <option value="SURGICAL">Surgical</option>
                                            </select>
                                        </div>

                                        {/* Cost Price */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price (₹)</label>
                                            <input
                                                type="number"
                                                name="costPrice"
                                                step="0.01"
                                                value={formData.costPrice}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>

                                        {/* Selling Price */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price (₹)</label>
                                            <input
                                                type="number"
                                                name="sellingPrice"
                                                step="0.01"
                                                value={formData.sellingPrice}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>

                                        {/* MRP */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">MRP (₹) *</label>
                                            <input
                                                type="number"
                                                name="mrp"
                                                step="0.01"
                                                required
                                                value={formData.mrp}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>

                                        {/* Quantity */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                                            <input
                                                type="number"
                                                name="quantity"
                                                required
                                                value={formData.quantity}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>

                                        {/* Reorder Level */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Level</label>
                                            <input
                                                type="number"
                                                name="reorderLevel"
                                                value={formData.reorderLevel}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>

                                        {/* Batch Number */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number</label>
                                            <input
                                                type="text"
                                                name="batchNumber"
                                                value={formData.batchNumber}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>

                                        {/* Expiry Date */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                                            <input
                                                type="date"
                                                name="expiryDate"
                                                value={formData.expiryDate}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>

                                        {/* Unit */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                                            <select
                                                name="unit"
                                                value={formData.unit}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="PCS">Pieces</option>
                                                <option value="STRIPS">Strips</option>
                                                <option value="BOTTLES">Bottles</option>
                                                <option value="BOXES">Boxes</option>
                                                <option value="ML">ML</option>
                                                <option value="MG">MG</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                        <textarea
                                            name="description"
                                            rows={2}
                                            value={formData.description}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    {/* Prescription Required */}
                                    <div className="mt-4 flex items-center">
                                        <input
                                            type="checkbox"
                                            name="prescription"
                                            id="prescription-edit"
                                            checked={formData.prescription}
                                            onChange={handleChange}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <label htmlFor="prescription-edit" className="ml-2 text-sm text-gray-700">
                                            Prescription Required
                                        </label>
                                    </div>
                                </form>

                                <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        onClick={handleSubmit}
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default EditProductModal;
