import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import styles from './Login.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [idToken, setIdToken] = useState('');
    const [toastMessage, setToastMessage] = useState({ error: false, message: '' })
    const { login } = useAuth();
    const navigate = useNavigate();

    // Reset Toast Message after 5 seconds
    const resetToast = () => {
        setTimeout(() => {
            setToastMessage({ error: false, message: '' });
        }, 5000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const token = await userCredential.user.getIdToken(true);
            login(token);
            setIdToken(token);
            setError('');
            console.log("Firebase ID Token:", token);  // Log the ID token to the console
            setToastMessage({ error: false, message: 'Login successful!' });
            resetToast();
        } catch (err) {
            setError(err.message);
            setIdToken('');
            setToastMessage({ error: true, message: 'Invalid email or password. Please try again.' });
            resetToast();
        }
    };

    return (
        <div className={styles.container}>
            {/* Toast Notification */}
            {toastMessage.message && (
                <div className={toastMessage.error ? styles.toastError : styles.toastSuccess}>
                    {toastMessage.message}
                </div>
            )}
            <h2 className={styles.title}>FlashPay</h2>
            <form className={styles.form} onSubmit={handleSubmit}>
                <h2 className={styles.title}>Login</h2>

                <label className={styles.label}>
                    Email:
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={styles.email}
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

                <button type="submit" className={styles.button}>
                    Login
                </button>

                {error && <p style={{ color: 'red' }}>{error}</p>}

                <p>
                    Don't have an account? <Link to="/register">Sign Up</Link>
                </p>
            </form>

            {idToken && (
                navigate('/dashboard')
            )}
        </div>
    );
}

export default Login;