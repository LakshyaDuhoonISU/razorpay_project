import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { gql } from 'graphql-tag';
import upiQRCode from '../assets/qr.jpeg';
import { useAuth } from './AuthContext';
import styles from './PaymentForm.module.css';

// GraphQL mutation
const UPDATE_SUBSCRIPTION = gql`
  mutation UpdateSubscription($id: ID!, $status: String!) {
    updateSubscription(id: $id, status: $status) {
      id
      status
    }
  }
`;

const PaymentForm = () => {
    const { state } = useLocation();
    const { subscriptionId, customerId, planId, amount, businessId } = state;
    const [paymentMethod, setPaymentMethod] = useState('');
    const [updateSubscription] = useMutation(UPDATE_SUBSCRIPTION);
    const navigate = useNavigate();
    const { idToken } = useAuth();
    const [qrCode, setQrCode] = useState('');

    const handlePayment = async (status) => {
        try {
            // Call the backend to create a transaction
            // console.log('businessId:', businessId);
            await fetch('http://localhost:8000/api/transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({
                    customerId: customerId._id,
                    planId,
                    businessId,
                    status,
                    amount,
                    method: paymentMethod,
                }),
            });

            // Update the subscription status
            await updateSubscription({
                variables: {
                    id: subscriptionId,
                    status: status === 'success' ? 'active' : 'cancelled',
                },
            });

            // Navigate to transactions page
            navigate('/transactions');
        } catch (error) {
            console.error('Error processing payment:', error);
            alert('An error occurred during the payment process.');
        }
    };

    useEffect(() => {
        const fetchQRCode = async () => {
            if (paymentMethod === 'UPI') {
                try {
                    const response = await fetch('http://localhost:8000/generate-qr', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            upiId: 'lakshyaduhoon723@okicici',
                            name: 'Lakshya Duhoon',
                            amount,
                        }),
                    });
                    const data = await response.json();
                    setQrCode(data.qrCode);
                } catch (error) {
                    console.error('Error fetching QR code:', error);
                }
            }
        };

        fetchQRCode();
    }, [paymentMethod]);

    return (
        <div className={styles.container}>
            <h2>Payment Form</h2>
            <label>
                Select Payment Method:
                <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className={styles.select}
                    required
                >
                    <option value="">-- Select --</option>
                    <option value="UPI">UPI</option>
                    <option value="Net Banking">Net Banking</option>
                    <option value="Credit/Debit Card">Credit/Debit Card</option>
                </select>
            </label>

            {paymentMethod === 'UPI' && (
                <div>
                    <h3>Scan the QR Code</h3>
                    {qrCode ? (
                        <img src={qrCode} alt="UPI QR Code" className={styles.qrCode} />
                    ) : (
                        <img src={upiQRCode} alt="UPI QR Code" className={styles.qrCode} />
                    )}
                </div>
            )}

            {paymentMethod === 'Net Banking' && (
                <div>
                    <h3>Select Bank</h3>
                    <select className={styles.select} required>
                        <option value="">-- Select Bank --</option>
                        <option value="SBI">State Bank of India</option>
                        <option value="HDFC">HDFC Bank</option>
                        <option value="ICICI">ICICI Bank</option>
                        <option value="Axis">Axis Bank</option>
                    </select>
                </div>
            )}

            {paymentMethod === 'Credit/Debit Card' && (
                <div>
                    <h3>Enter Card Details</h3>
                    <input
                        type="text"
                        placeholder="Card Number"
                        className={styles.input}
                        required
                        maxLength="16"
                    />
                    <input
                        type="text"
                        placeholder="Card Holder Name"
                        className={styles.input}
                        required
                    />
                    <input
                        type="text"
                        placeholder="MM/YY"
                        className={styles.input}
                        required
                    />
                    <input
                        type="password"
                        placeholder="CVV"
                        className={styles.input}
                        required
                        maxLength="3"
                    />
                </div>
            )}

            {paymentMethod && (
                <div className={styles.buttonContainer}>
                    <button onClick={() => handlePayment('success')} className={styles.confirmButton}>
                        Confirm Transaction
                    </button>
                    <button onClick={() => handlePayment('failed')} className={styles.failButton}>
                        Fail Transaction
                    </button>
                </div>
            )}
        </div>
    );
};


export default PaymentForm;