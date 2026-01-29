
import React, { useState, useMemo } from 'react';
import ProductSearch from '@/components/pos/ProductSearch';
import CustomerSelect from '@/components/pos/CustomerSelect';
import Cart from '@/components/pos/Cart';
import BillSummary from '@/components/pos/BillSummary';
import type { CartItem, Product, Customer } from '@/types';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { useConfirmation } from '@/context/ConfirmationContext';
import AddCustomerModal from '@/components/customers/AddCustomerModal';

const POS: React.FC = () => {
    const { confirm } = useConfirmation();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);

    // Fees & Payment
    const [globalDiscount, setGlobalDiscount] = useState(0);
    const [doctorFees, setDoctorFees] = useState(0);
    const [otherCharges, setOtherCharges] = useState(0);
    const [doctorName, setDoctorName] = useState('');
    const [notes, setNotes] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [amountPaid, setAmountPaid] = useState(0);

    const [loading, setLoading] = useState(false);

    // Computed Totals
    const { subtotal, totalTax, totalDiscount } = useMemo(() => {
        let subtotal = 0;
        let totalTax = 0;
        let totalDiscount = 0;

        cart.forEach(item => {
            const gross = item.cartPrice * item.cartQuantity;
            const discount = (gross * item.discountPercent) / 100;
            const taxable = gross - discount;
            const tax = (taxable * item.taxPercent) / 100;

            subtotal += taxable;
            totalTax += tax;
            totalDiscount += discount;
        });

        return { subtotal, totalTax, totalDiscount };
    }, [cart]);

    const handleSelectProduct = (product: Product) => {
        setCart(prev => {
            const existing = prev.findIndex(p => p.id === product.id);
            if (existing >= 0) {
                // Increment
                const updated = [...prev];
                const item = updated[existing];
                // Check stock?
                if (item.cartQuantity < item.quantity) {
                    item.cartQuantity += 1;
                    recalculateItem(item);
                } else {
                    toast.error(`Max stock reached for ${item.name}`);
                }
                return updated;
            } else {
                // Add new
                const newItem: CartItem = {
                    ...product,
                    cartQuantity: 1,
                    cartPrice: Number(product.sellingPrice),
                    discountPercent: 0,
                    taxAmount: 0, // calc
                    totalAmount: 0, // calc
                };
                recalculateItem(newItem);
                return [...prev, newItem];
            }
        });
    };

    const recalculateItem = (item: CartItem) => {
        const gross = item.cartPrice * item.cartQuantity;
        const discount = (gross * item.discountPercent) / 100;
        const taxable = gross - discount;
        const tax = (taxable * item.taxPercent) / 100;
        item.taxAmount = tax;
        item.totalAmount = taxable + tax;
    };

    const handleUpdateCartItem = (index: number, updates: Partial<CartItem>) => {
        setCart(prev => {
            const updated = [...prev];
            const item = { ...updated[index], ...updates };
            recalculateItem(item);
            updated[index] = item;
            return updated;
        });
    };

    const handleRemoveItem = (index: number) => {
        setCart(prev => prev.filter((_, i) => i !== index));
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setLoading(true);
        try {
            const payload = {
                customerId: selectedCustomer?.id,
                items: cart.map(item => ({
                    productId: item.id,
                    productName: item.name,
                    productSku: item.sku,
                    quantity: item.cartQuantity,
                    unitPrice: item.cartPrice,
                    discountPercent: item.discountPercent,
                    taxPercent: item.taxPercent
                })),
                paymentMethod,
                amountPaid, // Backend will check if this covers total.
                discountAmount: globalDiscount,
                doctorFees,
                otherCharges,
                doctorName,
                notes
            };

            const res = await api.post('/billing/bills', payload);
            const billId = res.data.data.id;

            // Open print preview in new window using HTML endpoint
            try {
                // Use fetch API directly to get raw HTML (axios can have issues with responseType)
                const token = localStorage.getItem('token');
                const htmlResponse = await fetch(`/api/v1/printing/bills/${billId}/html?size=80mm`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!htmlResponse.ok) {
                    const errorData = await htmlResponse.json().catch(() => ({}));
                    throw new Error(errorData.message || `HTTP error ${htmlResponse.status}`);
                }

                const htmlContent = await htmlResponse.text();

                // Open a new window and write the HTML content
                const printWindow = window.open('', '_blank', 'width=400,height=600');
                if (printWindow) {
                    printWindow.document.write(htmlContent);
                    printWindow.document.close();
                    // Focus the new window
                    printWindow.focus();
                    toast.success('Bill created successfully!');
                } else {
                    console.error('Popup was blocked');
                    toast.success('Bill created! Popup was blocked. Please allow popups to print.');
                }
            } catch (printError: any) {
                console.error('Print generation failed:', printError);
                toast.success('Bill created successfully! Print preview failed.');
            }

            // Reset
            setCart([]);
            setSelectedCustomer(null);
            setAmountPaid(0);
            setGlobalDiscount(0);
            setDoctorFees(0);
            setOtherCharges(0);
            setDoctorName('');
            setNotes('');

        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Checkout Failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectCustomer = async (customer: Customer | null) => {
        setSelectedCustomer(customer);

        if (customer && cart.length === 0) {
            // Check for previous bill items if cart is empty
            try {
                const response = await api.get(`/customers/${customer.id}/last-bill-items`);
                const items = response.data.data;

                if (items && items.length > 0) {
                    // Ask user confirmation
                    const confirmFill = await confirm(
                        `Found ${items.length} items from ${customer.firstName}'s last bill. Add them to current bill?`,
                        'Load Previous Items',
                        'info'
                    );

                    if (confirmFill) {
                        const newCartItems: CartItem[] = items.map((item: any) => {
                            const newItem: CartItem = {
                                id: item.productId,
                                name: item.productName,
                                sku: item.productSku,
                                sellingPrice: Number(item.product.sellingPrice),
                                mrp: Number(item.product.mrp),
                                quantity: Number(item.product.quantity), // Current stock
                                unit: item.product.unit,
                                isActive: item.product.isActive,
                                category: item.product.category || 'General',

                                // Missing required Product fields
                                costPrice: 0,
                                minStockLevel: 0,
                                reorderLevel: 0,
                                taxPercent: Number(item.product.taxPercent || 0),

                                // Cart specifics
                                cartQuantity: Number(item.quantity), // Use quantity from last bill
                                cartPrice: Number(item.product.sellingPrice), // Use CURRENT selling price
                                discountPercent: 0, // Reset discount
                                taxAmount: 0,
                                totalAmount: 0
                            };
                            recalculateItem(newItem);
                            return newItem;
                        });

                        setCart(newCartItems);
                        toast.success('Items loaded from history');
                    }
                }
            } catch (error) {
                console.error('Failed to fetch last bill items', error);
            }
        }
    };

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col gap-4">
            {/* Top Bar: Search & Customer */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <ProductSearch onSelectProduct={handleSelectProduct} />
                </div>
                <div className="flex-1">
                    <CustomerSelect
                        selectedCustomer={selectedCustomer}
                        onSelectCustomer={handleSelectCustomer}
                        onAddNew={() => setIsAddCustomerModalOpen(true)}
                    />
                    <AddCustomerModal
                        isOpen={isAddCustomerModalOpen}
                        onClose={() => setIsAddCustomerModalOpen(false)}
                        onSuccess={() => {
                            setIsAddCustomerModalOpen(false);
                            toast.success('Customer added successfully! You can now search for them.');
                        }}
                    />
                </div>
            </div>

            {/* Main Content: Cart & Summary */}
            <div className="flex flex-col lg:flex-row gap-4 flex-1 overflow-hidden">
                {/* Cart Table */}
                <div className="flex-[2] overflow-hidden min-h-[300px]">
                    <Cart
                        items={cart}
                        onUpdateItem={handleUpdateCartItem}
                        onRemoveItem={handleRemoveItem}
                    />
                </div>

                {/* Sidebar Summary */}
                <div className="flex-1 min-w-[300px] overflow-auto">
                    <BillSummary
                        subtotal={subtotal}
                        totalTax={totalTax}
                        totalDiscount={totalDiscount}
                        globalDiscount={globalDiscount}
                        doctorFees={doctorFees}
                        otherCharges={otherCharges}
                        doctorName={doctorName}
                        notes={notes}
                        paymentMethod={paymentMethod}
                        amountPaid={amountPaid}
                        onChange={(field, value) => {
                            switch (field) {
                                case 'globalDiscount': setGlobalDiscount(value); break;
                                case 'doctorFees': setDoctorFees(value); break;
                                case 'otherCharges': setOtherCharges(value); break;
                                case 'doctorName': setDoctorName(value); break;
                                case 'notes': setNotes(value); break;
                                case 'paymentMethod': setPaymentMethod(value); break;
                                case 'amountPaid': setAmountPaid(value); break;
                            }
                        }}
                        onCheckout={handleCheckout}
                        loading={loading}
                    />
                </div>
            </div>
        </div>
    );
};

export default POS;
