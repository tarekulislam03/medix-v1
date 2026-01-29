import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Combobox } from '@headlessui/react';
import { clsx } from 'clsx';
import api from '@/services/api';
import type { Product } from '@/types';

interface ProductSearchProps {
    onSelectProduct: (product: Product) => void;
}

const ProductSearch: React.FC<ProductSearchProps> = ({ onSelectProduct }) => {
    const [query, setQuery] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.length >= 2) {
                setLoading(true);
                api.get(`/billing/products/search?q=${query}`)
                    .then(res => setProducts(res.data.data))
                    .catch(console.error)
                    .finally(() => setLoading(false));
            } else {
                setProducts([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    return (
        <div className="relative w-full">
            <Combobox value={null} onChange={(product: Product | null) => {
                if (product) {
                    onSelectProduct(product);
                    setQuery('');
                }
            }}>
                <div className="relative mt-1">
                    <div className="relative w-full cursor-default overflow-hidden rounded-xl bg-white text-left shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-300 sm:text-sm border border-gray-300">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <Combobox.Input
                            className="w-full border-none py-3 pl-10 pr-10 text-sm leading-5 text-gray-900 focus:ring-0 outline-none"
                            displayValue={(product: Product) => product?.name || ''}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Scan barcode or search product..."
                            autoFocus
                        />
                    </div>
                    <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50">
                        {products.length === 0 && query !== '' && !loading ? (
                            <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                                Nothing found.
                            </div>
                        ) : (
                            products.map((product) => (
                                <Combobox.Option
                                    key={product.id}
                                    className={({ active }) =>
                                        clsx(
                                            'relative cursor-default select-none py-2 pl-4 pr-4',
                                            active ? 'bg-blue-600 text-white' : 'text-gray-900'
                                        )
                                    }
                                    value={product}
                                >
                                    {({ selected, active }) => (
                                        <div className="flex justify-between items-center">
                                            <div className="flex flex-col">
                                                <span className={clsx("block truncate font-medium", selected ? 'font-bold' : 'font-normal')}>
                                                    {product.name}
                                                </span>
                                                <span className={clsx("text-xs truncate", active ? 'text-blue-200' : 'text-gray-500')}>
                                                    SKU: {product.sku} | Batch: {product.batchNumber || 'N/A'} | Exp: {product.expiryDate ? new Date(product.expiryDate).toLocaleDateString() : 'N/A'}
                                                </span>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className={clsx("font-bold", active ? 'text-white' : 'text-gray-900')}>
                                                    ₹{product.sellingPrice || product.mrp}
                                                </span>
                                                <span className={clsx("text-xs", active ? 'text-blue-200' : 'text-gray-500')}>
                                                    Stock: {product.quantity} {product.unit}
                                                </span>
                                            </div>
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

export default ProductSearch;
