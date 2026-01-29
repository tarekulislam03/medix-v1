import React, { createContext, useContext, useState, useRef } from 'react';
import { Dialog } from '@headlessui/react';
import { ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

type ValidVariant = 'danger' | 'info';

interface ConfirmationContextType {
    confirm: (message: string, title?: string, variant?: ValidVariant) => Promise<boolean>;
}

const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined);

export const ConfirmationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [variant, setVariant] = useState<ValidVariant>('danger');
    const resolveRef = useRef<((value: boolean) => void) | null>(null);

    const confirm = (msg: string, heading: string = 'Confirm Action', type: ValidVariant = 'danger') => {
        setMessage(msg);
        setTitle(heading);
        setVariant(type);
        setIsOpen(true);
        return new Promise<boolean>((resolve) => {
            resolveRef.current = resolve;
        });
    };

    const handleConfirm = () => {
        setIsOpen(false);
        resolveRef.current?.(true);
    };

    const handleCancel = () => {
        setIsOpen(false);
        resolveRef.current?.(false);
    };

    return (
        <ConfirmationContext.Provider value={{ confirm }}>
            {children}
            <Dialog open={isOpen} onClose={handleCancel} className="relative z-50">
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="mx-auto max-w-sm w-full rounded-2xl bg-white shadow-2xl p-6 border border-gray-100 transform transition-all">
                        <div className="flex items-start gap-4">
                            <div className={`flex-shrink-0 p-2 rounded-full ${variant === 'danger' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                {variant === 'danger' ? (
                                    <ExclamationTriangleIcon className="h-6 w-6" />
                                ) : (
                                    <InformationCircleIcon className="h-6 w-6" />
                                )}
                            </div>
                            <div className="flex-1">
                                <Dialog.Title className="text-lg font-bold text-gray-900">
                                    {title}
                                </Dialog.Title>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {message}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                className={`px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm transition-colors ${variant === 'danger'
                                        ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                                        : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                                    }`}
                            >
                                Confirm
                            </button>
                        </div>
                    </Dialog.Panel>
                </div>
            </Dialog>
        </ConfirmationContext.Provider>
    );
};

export const useConfirmation = () => {
    const context = useContext(ConfirmationContext);
    if (!context) throw new Error('useConfirmation must be used within a ConfirmationProvider');
    return context;
};
