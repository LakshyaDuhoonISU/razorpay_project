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
    const [cardDetails, setCardDetails] = useState({
        cardNumber: '',
        cardHolderName: '',
        expiryDate: '',
        cvv: '',
    });
    const [updateSubscription] = useMutation(UPDATE_SUBSCRIPTION);
    const navigate = useNavigate();
    const { idToken } = useAuth();
    const [qrCode, setQrCode] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCardDetails((prevDetails) => ({
            ...prevDetails,
            [name]: value,
        }));
    };

    const handlePayment = async (status) => {
        // Validate Credit/Debit Card fields if selected
        if (paymentMethod === 'Credit/Debit Card') {
            const { cardNumber, cardHolderName, expiryDate, cvv } = cardDetails;

            if (!cardNumber || cardNumber.length !== 16) {
                alert('Please enter a valid 16-digit card number.');
                return;
            }
            if (!cardHolderName) {
                alert('Please enter the cardholder name.');
                return;
            }
            if (!expiryDate || expiryDate.length !== 5 || !/^\d{2}\/\d{2}$/.test(expiryDate)) {
                alert('Please enter a valid expiry date in MM/YY format.');
                return;
            }

            // Extract year and validate
            const [month, year] = expiryDate.split('/').map((val) => parseInt(val));
            if (year < 25) {
                alert('Please enter a valid expiry date. Year should be at least 2025.');
                return;
            }
            if (month < 1 || month > 12) {
                alert('Please enter a valid expiry date. Month should be between 01 and 12.');
                return;
            }

            if (!cvv || cvv.length !== 3 || !/^\d{3}$/.test(cvv)) {
                alert('Please enter a valid 3-digit numeric CVV.');
                return;
            }
        }

        try {
            await fetch('http://localhost:8000/api/transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
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

            await updateSubscription({
                variables: {
                    id: subscriptionId,
                    status: status === 'success' ? 'active' : 'cancelled',
                },
            });

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
            <h2>Payment</h2>
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
                <form>
                    <h3>Enter Card Details</h3>
                    <input
                        type="text"
                        placeholder="Card Number"
                        name="cardNumber"
                        value={cardDetails.cardNumber}
                        onChange={handleInputChange}
                        className={styles.input}
                        maxLength="16"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Card Holder Name"
                        name="cardHolderName"
                        value={cardDetails.cardHolderName}
                        onChange={handleInputChange}
                        className={styles.input}
                        required
                    />
                    <input
                        type="text"
                        placeholder="MM/YY"
                        name="expiryDate"
                        value={cardDetails.expiryDate}
                        onChange={handleInputChange}
                        className={styles.input}
                        maxLength="5"
                        required
                    />
                    <input
                        type="password"
                        placeholder="CVV"
                        name="cvv"
                        value={cardDetails.cvv}
                        onChange={handleInputChange}
                        className={styles.input}
                        maxLength="3"
                        required
                    />
                </form>
            )}

            {paymentMethod && (
                <div className={styles.buttonContainer}>
                    <button
                        type="button"
                        onClick={() => handlePayment('success')}
                        className={styles.confirmButton}
                    >
                        Confirm Transaction
                    </button>
                    <button
                        type="button"
                        onClick={() => handlePayment('failed')}
                        className={styles.failButton}
                    >
                        Fail Transaction
                    </button>
                </div>
            )}
        </div>
    );
};

export default PaymentForm;