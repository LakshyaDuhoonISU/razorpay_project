import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Box, Drawer, List, ListItem, ListItemText, IconButton, AppBar, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link } from 'react-router-dom';
import styles from './Transactions.module.css';

function Transactions() {
    const { idToken, businessId } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [drawerOpen, setDrawerOpen] = useState(false);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/transactions/', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${idToken}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setTransactions(data.data);
                } else {
                    console.error('Failed to fetch transactions');
                }
            } catch (error) {
                console.error('Error fetching transactions:', error);
            }
        };

        if (businessId) {
            fetchTransactions();
        }
    }, [businessId, idToken]);

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
                {transactions.length === 0 ? (
                    <p className={styles.noTransactions}>No transactions found</p>
                ) : (
                    <table className={styles.transactionTable}>
                        <thead>
                            <tr>
                                <th>Customer</th>
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
                                    <td>{transaction.customerId?.name || 'N/A'}</td>
                                    <td>{transaction.planId?.name || 'N/A'}</td>
                                    <td>${transaction.amount}</td>
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
}

export default Transactions;