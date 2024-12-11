import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Box, Drawer, List, ListItem, ListItemText, IconButton, AppBar, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link } from 'react-router-dom';
import styles from './Transactions.module.css';

function Transactions() {
    const { idToken, businessId } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        customerId: '',
        amount: '',
        method: 'Card',
        status: 'Pending',
        businessId: businessId,
    });
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [toastMessage, setToastMessage] = useState(''); // State for toast message
    const [toastError, setToastError] = useState(false); // State for error type in toast

    useEffect(() => {
        const storedBusinessId = localStorage.getItem('businessId');
        if (!businessId && storedBusinessId) {
            fetchTransactions(storedBusinessId);
        } else if (businessId) {
            fetchTransactions(businessId);
        }
    }, [businessId]);

    const fetchTransactions = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/transactions', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setTransactions((prevTransactions) => [...prevTransactions, data.data]);
            } else {
                console.log('Failed to fetch transactions');
            }
        } catch (error) {
            console.log('Error fetching transactions');
        }
    };

    const handleAddTransaction = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8000/api/transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
                body: JSON.stringify({ ...formData, businessId }),
            });

            if (response.ok) {
                const data = await response.json();
                setTransactions((prevTransactions) => [...prevTransactions, data.data]);
                setSuccessMessage('Transaction added successfully!');
                setToastMessage('Transaction added successfully!');
                setToastError(false); // Set as success
                setFormData({ customerId: '', amount: '', method: 'Card', status: 'Pending' });
                setShowForm(false);
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to add transaction');
                setToastMessage(errorData.message || 'Failed to add transaction');
                setToastError(false); // Set as success
                setTimeout(() => {
                    setToastMessage('');
                }, 5000);
            }
        } catch (error) {
            console.log('An error occurred while adding the transaction', error);
        }
    };

    const handleDeleteTransaction = async (transactionId) => {
        try {
            const response = await fetch(`http://localhost:8000/api/transactions/${transactionId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                },
            });

            if (response.ok) {
                setTransactions(transactions.filter((transaction) => transaction._id !== transactionId));
                setSuccessMessage('Transaction deleted successfully!');
                setToastMessage('Transaction deleted successfully!');
                setToastError(false); // Set as success
                setTimeout(() => {
                    setToastMessage('');
                }, 5000);
            } else {
                console.log('Failed to delete transaction');
            }
        } catch (error) {
            console.log('Error deleting transaction', error);
        }
    };

    const toggleDrawer = (open) => () => {
        setDrawerOpen(open);
    };

    return (
        <div className={styles.container}>
            {/* <ToastContainer position="bottom-right" autoClose={5000} /> */}

            {/* App Bar */}
            <AppBar position="fixed">
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        onClick={toggleDrawer(true)}
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Transaction Management
                    </Typography>
                </Toolbar>
            </AppBar>

            {/* Sidebar */}
            <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
                <Box role="presentation" onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
                    <List>
                        <ListItem button component={Link} to="/dashboard">
                            <ListItemText primary="Dashboard" />
                        </ListItem>
                        <ListItem button component={Link} to="/customers">
                            <ListItemText primary="Customers" />
                        </ListItem>
                        <ListItem button component={Link} to="/plans">
                            <ListItemText primary="Plans" />
                        </ListItem>
                        <ListItem button component={Link} to="/subscriptions">
                            <ListItemText primary="Subscriptions" />
                        </ListItem>
                    </List>
                </Box>
            </Drawer>

            {/* Main Content */}
            <Box className={styles.content}>
                <h2>Transactions</h2>
                <button className={styles.addButton} onClick={() => setShowForm(true)}>
                    Add Transaction
                </button>
                {transactions.length === 0 ? (
                    <p className={styles.noSubs}>No transactions found</p> // Display if there are no transactions
                ) : null}
                {showForm && (
                    <form className={styles.form} onSubmit={handleAddTransaction}>
                        <h3>Add Transaction</h3>
                        <input
                            type="text"
                            placeholder="Customer ID"
                            value={formData.customerId}
                            onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                            required
                        />
                        <input
                            type="number"
                            placeholder="Amount"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            required
                        />
                        <select
                            value={formData.method}
                            onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                        >
                            <option value="Card">Card</option>
                            <option value="UPI">UPI</option>
                            <option value="Netbanking">Netbanking</option>
                        </select>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="Pending">Pending</option>
                            <option value="Success">Success</option>
                            <option value="Failed">Failed</option>
                        </select>
                        <button type="submit" className={styles.saveButton}>
                            Add Transaction
                        </button>
                        <button type="button" className={styles.cancelButton} onClick={() => setShowForm(false)}>
                            Cancel
                        </button>
                    </form>
                )}

                <ul className={styles.transactionList}>
                    {transactions.map((transaction) => (
                        <li key={transaction._id} className={styles.transactionItem}>
                            <p>
                                <strong>Customer ID:</strong> {transaction.customerId}
                            </p>
                            <p>
                                <strong>Amount:</strong> ${transaction.amount}
                            </p>
                            <p>
                                <strong>Method:</strong> {transaction.method}
                            </p>
                            <p>
                                <strong>Status:</strong> {transaction.status}
                            </p>
                            <button onClick={() => handleDeleteTransaction(transaction._id)} className={styles.deleteButton}>
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>
            </Box>
            {/* Toast Notification */}
            {toastMessage && (
                <div className={toastError ? styles.toastError : styles.toastSuccess}>
                    {toastMessage}
                </div>
            )}
        </div>
    );
}

export default Transactions;
