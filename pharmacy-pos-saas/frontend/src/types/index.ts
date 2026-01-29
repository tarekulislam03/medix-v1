export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName?: string;
    role: string;
    storeId: string;
    storeName?: string;
}

export interface Customer {
    id: string;
    firstName: string;
    lastName?: string;
    phone: string;
    email?: string;
    address?: string;
    city?: string;
    totalPurchases?: number;
    lastVisit?: string;
}

export interface Product {
    id: string;
    name: string;
    genericName?: string;
    sku: string;
    barcode?: string;
    category: string;
    manufacturer?: string;

    costPrice: number;
    sellingPrice: number;
    mrp: number;
    taxPercent: number;

    quantity: number;
    minStockLevel: number;
    reorderLevel: number;
    unit: string;

    batchNumber?: string;
    expiryDate?: string;

    tabletsPerStrip?: number;
    qtyInMl?: number;

    description?: string;
    dosageForm?: string;
    strength?: string;
    prescription?: boolean;

    isActive: boolean;
}

export interface CartItem extends Product {
    cartQuantity: number;
    cartPrice: number; // Unit price in cart (editable)
    discountPercent: number;
    taxAmount: number; // Calculated
    totalAmount: number; // Net total
}

export interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
