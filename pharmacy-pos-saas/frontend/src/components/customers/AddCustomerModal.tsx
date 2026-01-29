import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { createCustomer, updateCustomer, type CreateCustomerInput, type Customer } from '@/services/customer';

interface AddCustomerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    customerToEdit?: Customer | null;
}

const AddCustomerModal: React.FC<AddCustomerModalProps> = ({ isOpen, onClose, onSuccess, customerToEdit }) => {
    const [formData, setFormData] = useState<CreateCustomerInput>({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        address: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (customerToEdit) {
                setFormData({
                    firstName: customerToEdit.firstName,
                    lastName: customerToEdit.lastName || '',
                    phone: customerToEdit.phone,
                    email: customerToEdit.email || '',
                    address: customerToEdit.address || ''
                });
            } else {
                setFormData({
                    firstName: '',
                    lastName: '',
                    phone: '',
                    email: '',
                    address: ''
                });
            }
            setError('');
        }
    }, [isOpen, customerToEdit]);

    const validatePhone = (phone: string) => {
        const re = /^\d{10}$/;
        return re.test(phone);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.firstName.trim()) {
            setError('First name is required');
            return;
        }

        if (!formData.phone.trim()) {
            setError('Phone number is required');
            return;
        }

        if (!validatePhone(formData.phone)) {
            setError('Please enter a valid 10-digit phone number');
            return;
        }

        setLoading(true);
        try {
            if (customerToEdit) {
                await updateCustomer(customerToEdit.id, formData);
            } else {
                await createCustomer(formData);
            }

            // Success cleanup passed to parent or handled here? 
            // Better to just call onSuccess which triggers refresh
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error('Failed to save customer', err);
            setError(err.response?.data?.message || `Failed to ${customerToEdit ? 'update' : 'create'} customer`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="mx-auto max-w-md w-full rounded-xl bg-white shadow-lg">
                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
                        <Dialog.Title className="text-lg font-semibold text-gray-900">
                            {customerToEdit ? 'Edit Customer' : 'Add New Customer'}
                        </Dialog.Title>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {error && (
                            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                            <input
                                type="tel"
                                required
                                placeholder="10-digit mobile number"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                value={formData.phone}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, ''); // Numeric only
                                    if (val.length <= 10) {
                                        setFormData({ ...formData, phone: val });
                                    }
                                }}
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Enter 10-digit mobile number without country code
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
                            <input
                                type="email"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address (Optional)</label>
                            <textarea
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : (customerToEdit ? 'Update Customer' : 'Add Customer')}
                            </button>
                        </div>
                    </form>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};

export default AddCustomerModal;
