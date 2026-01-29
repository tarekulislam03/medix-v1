import React, { useState, useRef } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, ArrowUpTrayIcon, DocumentTextIcon, CheckIcon, TrashIcon } from '@heroicons/react/24/outline';
import api from '@/services/api';
import toast from 'react-hot-toast';

interface ImportInvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface DetectedItem {
    medicine_name: string;
    quantity: number;
    batch_number: string;
    expiry_date: string;
    mrp: number;
    rate: number;
}

const ImportInvoiceModal: React.FC<ImportInvoiceModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [step, setStep] = useState<'upload' | 'preview'>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<DetectedItem[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        const formData = new FormData();
        formData.append('bill', file); // Field name changed to 'bill' per backend route

        try {
            // New route: /inventory/import-bill
            const response = await api.post('/inventory/import-bill', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                setItems(response.data.data); // Expecting array of medicines
                setStep('preview');
            } else {
                toast.error('Failed to process bill');
            }
        } catch (error: any) {
            console.error('Bill upload error', error);
            toast.error(error.response?.data?.message || 'Failed to analyze bill. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleItemChange = (index: number, field: keyof DetectedItem, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const handleDeleteRow = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const handleConfirm = async () => {
        if (items.length === 0) {
            toast.error('No items to import');
            return;
        }

        setLoading(true);
        try {
            await api.post('/inventory/confirm-import', { items });
            toast.success('Inventory updated successfully!');
            onSuccess();
            handleClose();
        } catch (error: any) {
            console.error('Confirm error', error);
            toast.error(error.response?.data?.message || 'Failed to save inventory');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setStep('upload');
        setFile(null);
        setItems([]);
        onClose();
    };

    return (
        <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className={`mx-auto w-full bg-white rounded-xl shadow-lg transition-all ${step === 'preview' ? 'max-w-6xl h-[90vh]' : 'max-w-md'}`}>

                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
                        <Dialog.Title className="text-lg font-semibold text-gray-900">
                            {step === 'upload' ? 'Import Supplier Bill' : 'Review & Confirm'}
                        </Dialog.Title>
                        <button onClick={handleClose} className="text-gray-400 hover:text-gray-500">
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="p-6 h-full overflow-hidden flex flex-col">
                        {step === 'upload' ? (
                            <div className="flex flex-col items-center justify-center space-y-6">
                                <div
                                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <ArrowUpTrayIcon className="h-12 w-12 text-gray-400 mb-4" />
                                    <p className="text-sm text-gray-600 font-medium text-center">Click to upload Bill (PDF/Image)</p>
                                    <p className="text-xs text-gray-400 mt-2">Supports PDF, PNG, JPG</p>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept=".pdf,.png,.jpg,.jpeg"
                                />

                                {file && (
                                    <div className="flex items-center gap-3 text-sm text-blue-600 font-medium bg-blue-50 px-4 py-3 rounded-lg w-full">
                                        <DocumentTextIcon className="h-5 w-5" />
                                        <span className="truncate">{file.name}</span>
                                    </div>
                                )}

                                <button
                                    onClick={handleUpload}
                                    disabled={!file || loading}
                                    className="w-full bg-green-600 text-white rounded-lg py-3 font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors flex justify-center items-center"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing OCR & AI...
                                        </>
                                    ) : 'Analyze & Extract'}
                                </button>
                                <p className="text-xs text-center text-gray-500 max-w-xs">
                                    Uses advanced AI to extract medicine tables from your bill.
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col h-full pb-16">
                                {/* Table */}
                                <div className="flex-1 overflow-auto border border-gray-200 rounded-lg">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine Name</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-32">Batch</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-32">Expiry</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase w-24">Qty</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase w-24">MRP</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase w-24">Rate</th>
                                                <th className="px-4 py-3 w-16"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {items.map((item, index) => (
                                                <tr key={index} className="hover:bg-gray-50 text-sm">
                                                    <td className="p-2">
                                                        <input
                                                            value={item.medicine_name}
                                                            onChange={(e) => handleItemChange(index, 'medicine_name', e.target.value)}
                                                            className="w-full border-gray-200 rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500"
                                                            placeholder="Product Name"
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <input
                                                            value={item.batch_number}
                                                            onChange={(e) => handleItemChange(index, 'batch_number', e.target.value)}
                                                            className="w-full border-gray-200 rounded px-2 py-1 text-center"
                                                            placeholder="Batch"
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <input
                                                            value={item.expiry_date}
                                                            onChange={(e) => handleItemChange(index, 'expiry_date', e.target.value)}
                                                            className="w-full border-gray-200 rounded px-2 py-1 text-center"
                                                            placeholder="YYYY-MM"
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <input
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                            className="w-full border-gray-200 rounded px-2 py-1 text-right"
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <input
                                                            type="number"
                                                            value={item.mrp}
                                                            onChange={(e) => handleItemChange(index, 'mrp', e.target.value)}
                                                            className="w-full border-gray-200 rounded px-2 py-1 text-right"
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <input
                                                            type="number"
                                                            value={item.rate}
                                                            onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                                                            className="w-full border-gray-200 rounded px-2 py-1 text-right"
                                                        />
                                                    </td>
                                                    <td className="p-2 text-center">
                                                        <button
                                                            onClick={() => handleDeleteRow(index)}
                                                            className="text-red-400 hover:text-red-600 transition-colors"
                                                            title="Remove Item"
                                                        >
                                                            <TrashIcon className="h-5 w-5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Footer */}
                                <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-gray-100">
                                    <button
                                        onClick={() => setStep('upload')}
                                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200"
                                    >
                                        Re-Upload
                                    </button>
                                    <button
                                        onClick={handleConfirm}
                                        disabled={loading || items.length === 0}
                                        className="px-4 py-2 text-white bg-green-600 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {loading ? 'Saving...' : (
                                            <>
                                                <CheckIcon className="h-4 w-4" />
                                                Confirm Import ({items.length})
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};

export default ImportInvoiceModal;
