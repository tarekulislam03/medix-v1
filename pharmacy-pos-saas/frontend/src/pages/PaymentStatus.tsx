import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const PaymentStatus: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const status = searchParams.get('status');
    const txId = searchParams.get('txId');
    const reason = searchParams.get('reason');

    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate('/dashboard/settings');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
            <div className={`rounded-full p-4 mb-4 ${status === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
                {status === 'success' ? (
                    <CheckCircleIcon className="h-16 w-16 text-green-600" />
                ) : (
                    <XCircleIcon className="h-16 w-16 text-red-600" />
                )}
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {status === 'success' ? 'Payment Successful!' : 'Payment Failed'}
            </h1>

            <p className="text-gray-600 mb-6 max-w-md">
                {status === 'success'
                    ? `Thank you for your payment. Your subscription has been activated successfully. Transaction ID: ${txId}`
                    : `We couldn't process your payment. Reason: ${reason || 'Unknown error'}. Please try again.`}
            </p>

            <div className="text-sm text-gray-500">
                Redirecting to settings in {countdown} seconds...
            </div>

            <div className="mt-6 flex gap-4">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
                >
                    Go to Dashboard
                </button>
            </div>
        </div>
    );
};

export default PaymentStatus;
