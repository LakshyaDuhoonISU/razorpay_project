import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './HomePage.module.css';

const Homepage = () => {
    const navigate = useNavigate();

    return (
        <div className={styles.container}>
            {/* Header Section */}
            <header className={styles.header}>
                <h1 className={styles.logo}>FlashPay</h1>
                <div className={styles.buttonGroup}>
                    <button
                        onClick={() => navigate('/login')}
                        className={styles.button}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => navigate('/register')}
                        className={styles.button}
                    >
                        Sign Up
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <section className={styles.hero}>
                <h2 className={styles.heroTitle}>Welcome to FlashPay</h2>
                <p className={styles.heroSubtitle}>
                    Simplifying subscription and customer management for your business.
                </p>
            </section>

            {/* Features Section */}
            <section className={styles.features}>
                <div className={styles.featureCard}>
                    <h3 className={styles.featureTitle}>Customer Management</h3>
                    <p className={styles.featureDescription}>
                        Manage your customers efficiently with detailed records and profiles.
                    </p>
                </div>
                <div className={styles.featureCard}>
                    <h3 className={styles.featureTitle}>Plan Management</h3>
                    <p className={styles.featureDescription}>
                        Create and manage subscription plans tailored to your customers.
                    </p>
                </div>
                <div className={styles.featureCard}>
                    <h3 className={styles.featureTitle}>Subscription Management</h3>
                    <p className={styles.featureDescription}>
                        Track subscriptions with ease and ensure timely renewals.
                    </p>
                </div>
                <div className={styles.featureCard}>
                    <h3 className={styles.featureTitle}>Transaction History</h3>
                    <p className={styles.featureDescription}>
                        View detailed transaction history to stay on top of your finances.
                    </p>
                </div>
            </section>

            {/* Footer Section */}
            <footer className={styles.footer}>
                <p>&copy; 2024 FlashPay. All Rights Reserved.</p>
            </footer>
        </div>
    );
};

export default Homepage;
