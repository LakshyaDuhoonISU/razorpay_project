import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import styles from './Signup.module.css'; 

const Signup = () => {
    const [businessName, setBusinessName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [toastMessage, setToastMessage] = useState({ error: false, message: '' });
    const navigate = useNavigate(); 

    // Reset Toast Message after 5 seconds
    const resetToast = () => {
        setTimeout(() => {
            setToastMessage({ error: false, message: '' });
        }, 5000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation for matching passwords
        if (password !== confirmPassword) {
            setToastMessage({ error: true, message: 'Passwords do not match' });
            resetToast();
            return;
        }

        // Prepare the business data to be sent to the backend
        const businessData = {
            name: businessName,
            email,
            phone,
            address,
            password,
        };

        try {
            const response = await fetch('http://localhost:8000/api/businesses/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(businessData),
            });

            const data = await response.json();

            if (response.ok) {
                // Clear the form fields and show success message
                setBusinessName('');
                setEmail('');
                setPhone('');
                setAddress('');
                setPassword('');
                setConfirmPassword('');
                setToastMessage({ error: false, message: 'Business registered successfully!' });
                resetToast();

                // Redirect to login page after successful registration
                navigate('/login');
            } else {
                setToastMessage({ error: true, message: data.error || 'Something went wrong, please try again.' });
                resetToast();
            }
        } catch (err) {
            setToastMessage({ error: true, message: 'Unable to process the request. Please try again later.' });
            resetToast();
        }
    };

    return (
        <div className={styles.container}>
            {/* Show Toast message if available */}
            {toastMessage.message && (
                <div
                    className={toastMessage.error ? styles.toastError : styles.toastSuccess}
                >
                    {toastMessage.message}
                </div>
            )}
            <h2 className={styles.title}>FlashPay</h2>
            <form className={styles.form} onSubmit={handleSubmit}>
                <h2 className={styles.title}>Register</h2>

                <label className={styles.label}>
                    Business Name:
                    <input
                        type="text"
                        placeholder="Business Name"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className={styles.input}
                        required
                    />
                </label>

                <label className={styles.label}>
                    Email:
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={styles.input}
                        required
                    />
                </label>

                <label className={styles.label}>
                    Phone:
                    <input
                        type="text"
                        placeholder="Phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={styles.input}
                        required
                    />
                </label>

                <label className={styles.label}>
                    Address:
                    <input
                        type="text"
                        placeholder="Address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className={styles.input}
                        required
                    />
                </label>

                <label className={styles.label}>
                    Password:
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={styles.input}
                        required
                    />
                </label>

                <label className={styles.label}>
                    Confirm Password:
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={styles.input}
                        required
                    />
                </label>

                <button type="submit" className={styles.button}>
                    Sign Up
                </button>

                <p>
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </form>
        </div>
    );
};

export default Signup;
