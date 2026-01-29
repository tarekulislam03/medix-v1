import React, { useState, useEffect } from 'react';
import {
    MagnifyingGlassIcon,
    PlusIcon,
    ExclamationTriangleIcon,
    PencilSquareIcon,
    TrashIcon,
    ArrowUpTrayIcon
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import api from '@/services/api';
import type { Product } from '@/types';
import AddProductModal from './AddProductModal';
import EditProductModal from './EditProductModal';
import ImportInvoiceModal from './ImportInvoiceModal';
import toast from 'react-hot-toast';

const InventoryList: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'lowStock' | 'expiring'>('all');
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params: any = {
                page: pagination.page,
                limit: pagination.limit,
                search: searchTerm,
            };

            if (filter === 'lowStock') params.lowStock = 'true';
            if (filter === 'expiring') params.expiring = 'true';

            const response = await api.get('/products', { params });
            setProducts(response.data.data);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error('Failed to fetch products', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Debounce search
        const timer = setTimeout(() => {
            fetchProducts();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, filter, pagination.page]);

    const toggleFilter = (newFilter: 'all' | 'lowStock' | 'expiring') => {
        setFilter(prev => prev === newFilter ? 'all' : newFilter);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleEdit = (product: Product) => {
        setSelectedProduct(product);
        setIsEditModalOpen(true);
    };

    const handleDelete = async (productId: string) => {
        try {
            await api.delete(`/products/${productId}`);
            setDeleteConfirm(null);
            fetchProducts();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete product');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header & Actions */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
                <h1 className="text-2xl font-bold text-gray-900 w-full sm:w-auto">Inventory</h1>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button
                        onClick={() => setIsImportModalOpen(true)}
                        className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm border border-gray-300 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 w-full sm:w-auto"
                    >
                        <ArrowUpTrayIcon className="h-5 w-5 mr-2 text-gray-400" />
                        Import From Supplier Bill
                    </button>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 w-full sm:w-auto"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Add Product
                    </button>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4 justify-between">
                <div className="relative flex-1 max-w-lg">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                        type="text"
                        className="block w-full rounded-md border-0 py-2 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                        placeholder="Search by name, SKU, or generic name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => toggleFilter('lowStock')}
                        className={clsx(
                            "inline-flex items-center px-4 py-2 text-sm font-medium rounded-md border",
                            filter === 'lowStock'
                                ? "bg-red-50 text-red-700 border-red-200 ring-1 ring-red-200"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        )}
                    >
                        <ExclamationTriangleIcon className={clsx("h-5 w-5 mr-2", filter === 'lowStock' ? "text-red-500" : "text-gray-400")} />
                        Low Stock
                    </button>
                    <button
                        onClick={() => toggleFilter('expiring')}
                        className={clsx(
                            "inline-flex items-center px-4 py-2 text-sm font-medium rounded-md border",
                            filter === 'expiring'
                                ? "bg-yellow-50 text-yellow-700 border-yellow-200 ring-1 ring-yellow-200"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        )}
                    >
                        Expiring Soon
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price (MRP)</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">Loading products...</td>
                                </tr>
                            ) : products.length > 0 ? (
                                products.map((product) => {
                                    const isLowStock = product.quantity <= product.reorderLevel;
                                    // Simple logic: if expiry date exists and < 30 days
                                    const isExpiring = product.expiryDate ? new Date(product.expiryDate) < new Date(new Date().setDate(new Date().getDate() + 30)) : false;

                                    return (
                                        <tr key={product.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-gray-900">{product.name}</span>
                                                    <span className="text-xs text-gray-500 text-truncate max-w-xs">{product.genericName}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.sku}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                                                    {product.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={clsx(
                                                    "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
                                                    isLowStock
                                                        ? "bg-red-50 text-red-700 ring-red-600/10"
                                                        : "bg-green-50 text-green-700 ring-green-600/20"
                                                )}>
                                                    {product.quantity} {product.unit}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{product.mrp}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {product.expiryDate ? (
                                                    <span className={clsx(isExpiring ? "text-red-600 font-medium" : "text-gray-500")}>
                                                        {new Date(product.expiryDate).toLocaleDateString()}
                                                    </span>
                                                ) : <span className="text-gray-400">N/A</span>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                {deleteConfirm === product.id ? (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => handleDelete(product.id)}
                                                            className="px-2 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700"
                                                        >
                                                            Confirm
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirm(null)}
                                                            className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => handleEdit(product)}
                                                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                                                            title="Edit Product"
                                                        >
                                                            <PencilSquareIcon className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirm(product.id)}
                                                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                                                            title="Delete Product"
                                                        >
                                                            <TrashIcon className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">No products found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Simple Pagination */}
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-medium">{pagination.total}</span> results
                            </p>
                        </div>
                        <div>
                            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                                    disabled={pagination.page === 1}
                                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                >
                                    <span className="sr-only">Previous</span>
                                    &larr; Prev
                                </button>
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                    disabled={pagination.page * pagination.limit >= pagination.total}
                                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                >
                                    Next &rarr;
                                    <span className="sr-only">Next</span>
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            <AddProductModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchProducts}
            />

            <EditProductModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedProduct(null);
                }}
                onSuccess={fetchProducts}
                product={selectedProduct}
            />

            <ImportInvoiceModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onSuccess={fetchProducts}
            />
        </div>
    );
};

export default InventoryList;
