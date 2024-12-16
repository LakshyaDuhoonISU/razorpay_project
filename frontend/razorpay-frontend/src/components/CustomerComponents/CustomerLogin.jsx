import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './CustomerLogin.module.css';
import { useCustomer } from './CustomerContext';

const CustomerLogin = () => {
    const [email, setEmail] = useState('');
    const [toastMessage, setToastMessage] = useState('');
    const { setCustomer } = useCustomer();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const showToast = (message) => {
        setToastMessage(message);
        setTimeout(() => {
            setToastMessage('');
        }, 5000);
    };

    const handleLogin = async () => {
        if (!email.trim()) {
            showToast('Email is required.');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8000/api/customers/profile/${email}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            if (response.ok) {
                const data = await response.json();
                setCustomer({ email, ...data.data }); // Store customer details in context
                navigate('/custdashboard');
            } else {
                const errorData = await response.json();
                showToast(errorData.message || 'Login failed. Please check your email.');
            }
        } catch (error) {
            console.log('Login error:', error);
            showToast('An error occurred. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.loginContainer}>
            <div className={styles.loginForm}>
                <h2>Customer Login</h2>
                <input
                    type="email"
                    className={styles.loginInput}
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <button
                    className={styles.loginButton}
                    onClick={handleLogin}
                    disabled={loading}
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
                <p>
                    Are you a business? <Link to="/login">Business Login</Link>
                </p>
            </div>
            {toastMessage && <div className={styles.toast}>{toastMessage}</div>}
        </div>
    );
};

export default CustomerLogin;