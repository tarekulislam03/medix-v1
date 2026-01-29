# POS Module Guide

The Point of Sale (POS) module allows you to process sales, manage the cart, and print receipts.

## Features
- **Product Search**: Scan barcode or type product name/SKU to search.
- **Dynamic Cart**: Adjust quantities, prices, discounts, and tax rates per item.
- **Customer Selection**: Search for existing customers by Name or Phone.
- **Bill Summary**: Add doctor fees, global discounts, and notes.
- **Thermal Printing**: Automatically generates and opens a PDF receipt (58mm/80mm) upon checkout.

## Usage
1. **Navigate**: Go to the `/pos` route (Click "POS Billing" on Dashboard or link in Sidebar).
2. **Search Product**: Type in the search box. Select a product to add to cart.
    - If product exists in cart, quantity increments.
3. **Edit Cart**:
    - Change Quantity in the table.
    - Click Trash icon to remove.
4. **Select Customer** (Optional): Search by phone number or name.
5. **Checkout**:
    - Review Totals.
    - Select Payment Method.
    - Enter "Amount Paid".
    - Click "Complete & Print".
6. **Printing**:
    - A PDF bill will open in a new tab.
    - Use your browser's print dialog to print to your thermal printer.
    - Adjust paper size (58mm or 80mm) in system print settings if needed (defaults to 80mm).

## Technical Details
- **Frontend**: React + Tailwind + Headless UI.
- **Backend**: Express + Prisma + Puppeteer.
- **Printing**: Server-side PDF generation ensures consistent formatting across devices.

## Pending Features
- "Add New Customer" modal from POS directly (Currently "Coming Soon").
