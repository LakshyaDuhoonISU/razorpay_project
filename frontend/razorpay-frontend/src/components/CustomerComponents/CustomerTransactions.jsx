import React, { useState, useEffect } from 'react';
import { useCustomer } from './CustomerContext'; // Use context to access customer details
import { Box, Drawer, List, ListItem, ListItemText, IconButton, AppBar, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from 'react-router-dom';
import styles from './CustomerTransactions.module.css';

const CustomerTransactions = () => {
    const navigate = useNavigate();
    const { customer } = useCustomer(); // Access customer data from context
    const [transactions, setTransactions] = useState([]);
    const [drawerOpen, setDrawerOpen] = useState(false);

    useEffect(() => {
        if (!customer) {
            navigate('/custlogin'); // Redirect if customer is not logged in
            return;
        }

        const fetchTransactions = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/customers/transactions/${customer._id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setTransactions(data.data);
                } else {
                    console.log('Failed to fetch transactions');
                }
            } catch (error) {
                console.log('Error fetching transactions:', error);
            }
        };

        fetchTransactions();
    }, [customer, navigate]);

    const toggleDrawer = (open) => () => {
        setDrawerOpen(open);
    };

    return (
        <div className={styles.container}>
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
                        Customer Transactions
                    </Typography>
                    <Typography variant="body1" sx={{ cursor: 'pointer' }} onClick={() => navigate('/custdashboard')}>
                        Back to Dashboard
                    </Typography>
                </Toolbar>
            </AppBar>

            {/* Sidebar */}
            <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
                <Box
                    sx={{ width: 250 }}
                    role="presentation"
                    onClick={toggleDrawer(false)}
                    onKeyDown={toggleDrawer(false)}
                >
                    <List>
                        <ListItem button onClick={() => navigate('/custsubscriptions')}>
                            <ListItemText primary="Subscriptions" />
                        </ListItem>
                        <ListItem button onClick={() => navigate('/custtransactions')}>
                            <ListItemText primary="View Transactions" />
                        </ListItem>
                    </List>
                </Box>
            </Drawer>

            {/* Main Content */}
            <Box className={styles.content}>
                <h2>Your Transactions</h2>
                {transactions.length === 0 ? (
                    <p className={styles.noTransactions}>No transactions found</p>
                ) : (
                    <table className={styles.transactionTable}>
                        <thead>
                            <tr>
                                <th>Plan</th>
                                <th>Amount</th>
                                <th>Method</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((transaction) => (
                                <tr key={transaction._id}>
                                    <td>{transaction.planId?.name || 'N/A'}</td>
                                    <td>₹{transaction.amount}</td>
                                    <td>{transaction.method}</td>
                                    <td>{transaction.status}</td>
                                    <td>{new Date(transaction.date).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </Box>
        </div>
    );
};

export default CustomerTransactions;