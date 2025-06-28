import React from 'react';
import { formatCurrency, formatDate, calculateGST, COMPANY_DETAILS } from '../constants';

const GSTInvoice = ({ invoice, order, onClose, onPrint }) => {
    const isIntraState = order.customer_state === 'Haryana';
    const gst = calculateGST(order.base_amount, isIntraState);
    
    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '900px' }}>
                <div className="p-4 border-b flex justify-between items-center no-print">
                    <h2 className="text-xl font-bold">Invoice Preview</h2>
                    <div className="flex space-x-2">
                        <button
                            onClick={onPrint}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            🖨️ Print
                        </button>
                        <button
                            onClick={onClose}
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                        >
                            Close
                        </button>
                    </div>
                </div>

                <div className="invoice-preview" id="invoice-content">
                    {/* Header */}
                    <div className="invoice-header-row">
                        <div className="company-logo">
                            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c3e50' }}>
                                FANTOPARK
                            </h1>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0' }}>
                                {COMPANY_DETAILS.name}
                            </h2>
                            <p style={{ margin: '4px 0' }}>{COMPANY_DETAILS.address}</p>
                            <p style={{ margin: '4px 0' }}>Email: {COMPANY_DETAILS.email} | Phone: {COMPANY_DETAILS.phone}</p>
                        </div>
                        <div className="invoice-title">
                            TAX INVOICE
                        </div>
                    </div>

                    {/* Invoice Meta */}
                    <div className="invoice-meta">
                        <div>
                            <p><strong>Invoice No:</strong> {invoice.invoice_number}</p>
                            <p><strong>Invoice Date:</strong> {formatDate(invoice.created_at)}</p>
                            <p><strong>Order No:</strong> {order.order_number}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p><strong>GSTIN:</strong> {COMPANY_DETAILS.gstin}</p>
                            <p><strong>PAN:</strong> {COMPANY_DETAILS.pan}</p>
                            <p><strong>CIN:</strong> {COMPANY_DETAILS.cin}</p>
                        </div>
                    </div>

                    {/* Customer Details */}
                    <div className="customer-section">
                        <h3 className="customer-title">Bill To:</h3>
                        <p><strong>{order.customer_name}</strong></p>
                        <p>Email: {order.customer_email}</p>
                        <p>Phone: {order.customer_phone}</p>
                        <p>Address: {order.customer_address}</p>
                        <p>State: {order.customer_state}</p>
                        {order.customer_gst && <p>GSTIN: {order.customer_gst}</p>}
                    </div>

                    {/* Items Table */}
                    <table className="items-table">
                        <thead>
                            <tr>
                                <th style={{ width: '5%' }}>Sr.</th>
                                <th style={{ width: '35%' }}>Description</th>
                                <th style={{ width: '10%' }}>HSN</th>
                                <th style={{ width: '10%' }}>Qty</th>
                                <th style={{ width: '15%' }}>Rate</th>
                                <th style={{ width: '10%' }}>Taxable</th>
                                <th style={{ width: '15%' }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>1</td>
                                <td>
                                    <strong>{order.event_name}</strong>
                                    <br />
                                    <small>Date: {formatDate(order.event_date)} | Venue: {order.venue}</small>
                                </td>
                                <td>{COMPANY_DETAILS.hsn}</td>
                                <td>{order.quantity}</td>
                                <td>₹{formatCurrency(order.price_per_ticket)}</td>
                                <td>₹{formatCurrency(order.base_amount)}</td>
                                <td>₹{formatCurrency(order.base_amount)}</td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Totals Table */}
                    <table className="totals-table">
                        <tbody>
                            <tr>
                                <td style={{ width: '70%', textAlign: 'right' }}><strong>Subtotal:</strong></td>
                                <td style={{ width: '30%', textAlign: 'right' }}>₹{formatCurrency(order.base_amount)}</td>
                            </tr>
                            {isIntraState ? (
                                <>
                                    <tr>
                                        <td style={{ textAlign: 'right' }}><strong>CGST @ 9%:</strong></td>
                                        <td style={{ textAlign: 'right' }}>₹{formatCurrency(gst.cgst)}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ textAlign: 'right' }}><strong>SGST @ 9%:</strong></td>
                                        <td style={{ textAlign: 'right' }}>₹{formatCurrency(gst.sgst)}</td>
                                    </tr>
                                </>
                            ) : (
                                <tr>
                                    <td style={{ textAlign: 'right' }}><strong>IGST @ 18%:</strong></td>
                                    <td style={{ textAlign: 'right' }}>₹{formatCurrency(gst.igst)}</td>
                                </tr>
                            )}
                            <tr style={{ backgroundColor: '#f8f9fa', fontWeight: 'bold' }}>
                                <td style={{ textAlign: 'right' }}><strong>Grand Total:</strong></td>
                                <td style={{ textAlign: 'right' }}>₹{formatCurrency(order.total_amount)}</td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Bank Details */}
                    <div className="bank-details">
                        <div>
                            <h4 style={{ margin: '0 0 8px 0', fontSize: '11px' }}>Bank Details:</h4>
                            <p><strong>Bank Name:</strong> {COMPANY_DETAILS.bankDetails.bankName}</p>
                            <p><strong>Account Name:</strong> {COMPANY_DETAILS.bankDetails.accountName}</p>
                            <p><strong>Account No:</strong> {COMPANY_DETAILS.bankDetails.accountNumber}</p>
                            <p><strong>IFSC:</strong> {COMPANY_DETAILS.bankDetails.ifsc}</p>
                            <p><strong>Branch:</strong> {COMPANY_DETAILS.bankDetails.branch}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <h4 style={{ margin: '0 0 8px 0', fontSize: '11px' }}>Amount in Words:</h4>
                            <p style={{ fontStyle: 'italic' }}>
                                {numberToWords(order.total_amount)} Rupees Only
                            </p>
                        </div>
                    </div>

                    {/* Terms */}
                    <div className="terms-section">
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '9px' }}>Terms & Conditions:</h4>
                        <ol style={{ margin: '0', paddingLeft: '20px' }}>
                            <li>All disputes are subject to Gurgaon jurisdiction</li>
                            <li>Tickets once sold cannot be cancelled or refunded</li>
                            <li>Please carry a valid ID proof at the venue</li>
                        </ol>
                    </div>

                    {/* Signature */}
                    <div className="signature-section">
                        <div className="signature-box">
                            <div className="signature-line">Customer Signature</div>
                        </div>
                        <div className="signature-box">
                            <div className="signature-line">Authorized Signatory</div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="footer-section">
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontWeight: 'bold', marginBottom: '2px' }}>Thank you for your business!</p>
                            <p>For any queries, please contact us at {COMPANY_DETAILS.email}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper function to convert number to words
function numberToWords(num) {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    if (num === 0) return 'Zero';

    function convertHundreds(n) {
        let str = '';
        if (n > 99) {
            str += ones[Math.floor(n / 100)] + ' Hundred ';
            n %= 100;
        }
        if (n > 19) {
            str += tens[Math.floor(n / 10)] + ' ';
            n %= 10;
        } else if (n > 9) {
            str += teens[n - 10] + ' ';
            return str;
        }
        if (n > 0) {
            str += ones[n] + ' ';
        }
        return str;
    }

    function convertThousands(n) {
        if (n >= 100000) {
            return convertThousands(Math.floor(n / 100000)) + 'Lakh ' + convertThousands(n % 100000);
        } else if (n >= 1000) {
            return convertHundreds(Math.floor(n / 1000)) + 'Thousand ' + convertHundreds(n % 1000);
        } else {
            return convertHundreds(n);
        }
    }

    return convertThousands(Math.floor(num)).trim();
}

export default GSTInvoice;
