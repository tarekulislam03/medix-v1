import React from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import type { CartItem } from '@/types';

interface CartProps {
    items: CartItem[];
    onUpdateItem: (index: number, updates: Partial<CartItem>) => void;
    onRemoveItem: (index: number) => void;
}

const Cart: React.FC<CartProps> = ({ items, onUpdateItem, onRemoveItem }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
            <div className="overflow-x-auto flex-1">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">Item</th>
                            <th scope="col" className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Batch</th>
                            <th scope="col" className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Exp</th>
                            <th scope="col" className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Price</th>
                            <th scope="col" className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Qty</th>
                            <th scope="col" className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Disc%</th>
                            <th scope="col" className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Tax%</th>
                            <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Total</th>
                            <th scope="col" className="px-2 py-3 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="px-6 py-10 text-center text-sm text-gray-500">
                                    Scan items or search to add to cart
                                </td>
                            </tr>
                        ) : (
                            items.map((item, index) => (
                                <tr key={`${item.id}-${index}`} className="hover:bg-gray-50">
                                    <td className="px-4 py-2">
                                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                        <div className="text-xs text-gray-500">{item.genericName}</div>
                                    </td>
                                    <td className="px-2 py-2 text-center text-xs text-gray-500">
                                        {item.batchNumber || '-'}
                                    </td>
                                    <td className="px-2 py-2 text-center text-xs text-gray-500">
                                        {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString(undefined, { month: 'short', year: '2-digit' }) : '-'}
                                    </td>
                                    <td className="px-2 py-2">
                                        <input
                                            type="number"
                                            min="0"
                                            className="block w-full rounded border-0 py-1 text-center text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                            value={item.cartPrice}
                                            onChange={(e) => onUpdateItem(index, { cartPrice: Number(e.target.value) })}
                                        />
                                    </td>
                                    <td className="px-2 py-2">
                                        <input
                                            type="number"
                                            min="1"
                                            max={item.quantity} // Limit to stock? Or allow override? Usually allow but warn.
                                            className="block w-full rounded border-0 py-1 text-center text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 font-bold"
                                            value={item.cartQuantity}
                                            onChange={(e) => onUpdateItem(index, { cartQuantity: Number(e.target.value) })}
                                        />
                                    </td>
                                    <td className="px-2 py-2">
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            className="block w-full rounded border-0 py-1 text-center text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                            value={item.discountPercent}
                                            onChange={(e) => onUpdateItem(index, { discountPercent: Number(e.target.value) })}
                                        />
                                    </td>
                                    <td className="px-2 py-2 text-center text-sm text-gray-900">
                                        {item.taxPercent}%
                                    </td>
                                    <td className="px-4 py-2 text-right text-sm font-bold text-gray-900">
                                        ₹{item.totalAmount.toFixed(2)}
                                    </td>
                                    <td className="px-2 py-2 text-center">
                                        <button
                                            onClick={() => onRemoveItem(index)}
                                            className="text-red-500 hover:text-red-700 rounded-full p-1 hover:bg-red-50"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            )))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Cart;
