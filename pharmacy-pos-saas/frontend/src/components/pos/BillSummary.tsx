import React from 'react';
import { PrinterIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';

interface BillSummaryProps {
    subtotal: number;
    totalTax: number;
    totalDiscount: number;

    // Modifiable
    globalDiscount: number;
    doctorFees: number;
    otherCharges: number;
    doctorName: string;
    notes: string;
    paymentMethod: string;
    amountPaid: number;

    onChange: (field: string, value: any) => void;
    onCheckout: () => void;
    loading: boolean;
}

const BillSummary: React.FC<BillSummaryProps> = (props) => {
    // Calculate Grand Total
    // Backend Logic: subtotal + totalTax + doctorFees + otherCharges - globalDiscount;
    const grandTotal = props.subtotal + props.totalTax + props.doctorFees + props.otherCharges - props.globalDiscount;
    const change = Math.max(0, props.amountPaid - grandTotal);
    const balance = Math.max(0, grandTotal - props.amountPaid);

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 h-full flex flex-col gap-4">
            <h2 className="text-lg font-bold text-gray-900 border-b pb-2">Order Summary</h2>

            {/* Fees & Adjustments */}
            <div className="space-y-3 flex-1 overflow-auto">
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium">₹{props.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Tax</span>
                        <span className="font-medium">₹{props.totalTax.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center text-sm gap-2">
                        <span className="text-gray-600">Dr. Fees</span>
                        <input
                            type="number" min="0"
                            className="w-20 rounded border-gray-300 py-0 text-right text-sm focus:ring-blue-500"
                            value={props.doctorFees}
                            onChange={(e) => props.onChange('doctorFees', Number(e.target.value))}
                        />
                    </div>
                    <div className="flex justify-between items-center text-sm gap-2">
                        <span className="text-gray-600">Other</span>
                        <input
                            type="number" min="0"
                            className="w-20 rounded border-gray-300 py-0 text-right text-sm focus:ring-blue-500"
                            value={props.otherCharges}
                            onChange={(e) => props.onChange('otherCharges', Number(e.target.value))}
                        />
                    </div>
                </div>

                <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between items-center text-xl font-bold text-gray-900 bg-gray-50 p-2 rounded">
                        <span>Total</span>
                        <span>₹{grandTotal.toFixed(2)}</span>
                    </div>
                </div>

                {/* Payment */}
                <div className="space-y-3 pt-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                        <div className="mt-1 flex gap-2">
                            {['CASH', 'UPI', 'CARD'].map((method) => (
                                <button
                                    key={method}
                                    onClick={() => props.onChange('paymentMethod', method)}
                                    className={clsx(
                                        "flex-1 py-1 text-sm font-medium rounded border",
                                        props.paymentMethod === method
                                            ? "bg-blue-600 text-white border-blue-600"
                                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                    )}
                                >
                                    {method}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Amount Paid</label>
                        <div className="relative mt-1 rounded-md shadow-sm">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="text-gray-500 sm:text-sm">₹</span>
                            </div>
                            <input
                                type="number"
                                className="block w-full rounded-md border-0 py-2 pl-7 pr-12 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-xl font-bold"
                                placeholder="0.00"
                                value={props.amountPaid}
                                onChange={(e) => props.onChange('amountPaid', Number(e.target.value))}
                            />
                        </div>
                    </div>

                    {balance > 0 ? (
                        <div className="text-red-600 text-sm font-medium text-right">
                            Balance: ₹{balance.toFixed(2)}
                        </div>
                    ) : (
                        <div className="text-green-600 text-sm font-medium text-right">
                            Change: ₹{change.toFixed(2)}
                        </div>
                    )}
                </div>
            </div>

            <button
                onClick={props.onCheckout}
                disabled={props.loading || grandTotal === 0}
                className="w-full rounded-md bg-blue-600 px-3.5 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
                {props.loading ? (
                    <>Processing...</>
                ) : (
                    <>
                        <PrinterIcon className="h-5 w-5" />
                        Complete & Print
                    </>
                )}
            </button>
        </div>
    );
};

export default BillSummary;
