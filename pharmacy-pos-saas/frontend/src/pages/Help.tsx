import React from 'react';

const Help: React.FC = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Help & Support</h1>

            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Frequently Asked Questions</h2>
                <div className="space-y-4">
                    <details className="group border-b border-gray-100 pb-4">
                        <summary className="flex justify-between items-center font-medium cursor-pointer list-none text-gray-800 hover:text-blue-600">
                            <span>How do I add a new product?</span>
                            <span className="transition group-open:rotate-180">
                                <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                            </span>
                        </summary>
                        <p className="text-gray-600 mt-2 group-open:animate-fadeIn text-sm leading-relaxed">
                            Go to the <strong>Inventory</strong> page from the sidebar and click the "Add Product" button. Fill in the required details including product name, price, SKU, and stock level.
                        </p>
                    </details>
                    <details className="group border-b border-gray-100 pb-4">
                        <summary className="flex justify-between items-center font-medium cursor-pointer list-none text-gray-800 hover:text-blue-600">
                            <span>How do I generate a bill?</span>
                            <span className="transition group-open:rotate-180">
                                <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                            </span>
                        </summary>
                        <p className="text-gray-600 mt-2 group-open:animate-fadeIn text-sm leading-relaxed">
                            Navigate to the <strong>POS</strong> page. Search for products in the left panel, add them to the cart, select a customer (optional), and click "Proceed to Pay" to complete the transaction.
                        </p>
                    </details>
                    <details className="group border-b border-gray-100 pb-4">
                        <summary className="flex justify-between items-center font-medium cursor-pointer list-none text-gray-800 hover:text-blue-600">
                            <span>Can I add walk-in customers?</span>
                            <span className="transition group-open:rotate-180">
                                <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                            </span>
                        </summary>
                        <p className="text-gray-600 mt-2 group-open:animate-fadeIn text-sm leading-relaxed">
                            Yes. In the POS screen, if you don't select a customer, the bill will be assigned to a generic "Walk-in Customer". You can also create a new customer on the fly using the "+" button in the customer search.
                        </p>
                    </details>
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
                <h3 className="text-blue-900 font-medium text-lg">Need more help?</h3>
                <p className="text-blue-700 mt-1">Contact our support team for assistance with any issues.</p>
                <div className="mt-4">
                    <a href="mailto:support@medix.com" className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                        Contact Support
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Help;
