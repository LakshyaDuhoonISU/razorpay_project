import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CustomerSubscriptions.module.css';
import { Box, Drawer, List, ListItem, ListItemText, IconButton, AppBar, Toolbar, Typography, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useCustomer } from './CustomerContext';
import { gql, useMutation } from '@apollo/client';

// GraphQL mutations for updating subscription
const UPDATE_SUBSCRIPTION = gql`
  mutation UpdateSubscription($id: ID!, $planId: ID, $price: Float, $startDate: String, $endDate: String, $status: String) {
    updateSubscription(id: $id, planId: $planId, price: $price, startDate: $startDate, endDate: $endDate, status: $status) {
      id
      customerId
      planId
      price
      startDate
      endDate
      status
    }
  }
`;

const CustomerSubscriptions = () => {
    const navigate = useNavigate();
    const { customer } = useCustomer();
    const [subscriptions, setSubscriptions] = useState([]);
    const [toastMessage, setToastMessage] = useState('');
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [updateSubscription] = useMutation(UPDATE_SUBSCRIPTION);
    const [openDialog, setOpenDialog] = useState(false);

    useEffect(() => {
        if (!customer) {
            navigate('/custlogin'); // Redirect to login if customer is not logged in
        } else {
            fetchSubscriptions();
        }
    }, [customer, navigate]);

    const showToast = (message) => {
        setToastMessage(message);
        setTimeout(() => {
            setToastMessage('');
        }, 5000);
    };

    const toggleDrawer = (open) => () => {
        setDrawerOpen(open);
    };

    // Fetch customer subscriptions
    const fetchSubscriptions = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/subscriptions/${customer._id}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            if (response.ok) {
                const data = await response.json();
                setSubscriptions(data.data);
            } else {
                console.log('Failed to fetch subscriptions');
                showToast('Failed to fetch subscriptions.');
            }
        } catch (error) {
            console.log('Error fetching subscriptions:', error);
            showToast('An error occurred. Please try again later.');
        }
    };

    // Handle payment for a subscription
    const handlePayment = (subscription) => {
        // console.log('Subscription:', subscription);
        navigate('/payment', {
            state: {
                subscriptionId: subscription._id,
                amount: subscription.price,
                customerId: subscription.customerId,
                planId: subscription.planId,
                businessId: subscription.businessId,
            },
        });
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
                        Customer Subscriptions
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
                <h2>Your Subscriptions</h2>
                {subscriptions.length === 0 ? (
                    <p>No subscriptions found.</p>
                ) : (
                    <table className={styles.subscriptionTable}>
                        <thead>
                            <tr>
                                <th>Plan</th>
                                <th>Price</th>
                                <th>Start Date</th>
                                <th>End Date</th>
                                <th>Status</th>
                                <th>Payment Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscriptions.map((subscription) => (
                                <tr key={subscription._id}>
                                    <td>{subscription.planId?.name || 'N/A'}</td>
                                    <td>₹{subscription.price}</td>
                                    <td>
                                        {new Date(subscription.startDate).toLocaleDateString()}
                                    </td>
                                    <td>
                                        {subscription.endDate
                                            ? new Date(subscription.endDate).toLocaleDateString()
                                            : 'Ongoing'}
                                    </td>
                                    <td>{subscription.status}</td>
                                    <td>{subscription.paymentStatus}</td>
                                    {subscription.status === 'active' && subscription.paymentStatus === 'pending' && (
                                        <td>
                                            <button
                                                className={styles.payButton}
                                                onClick={() => handlePayment(subscription)}
                                            >
                                                Pay
                                            </button>
                                        </td>
                                    )}

                                    {subscription.status === 'active' && subscription.paymentStatus === 'paid' && (
                                        <td>
                                            <button
                                                className={styles.payButton}
                                                onClick={() => cancelSubscription(subscription._id)}
                                            >
                                                Cancel
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </Box>

            {/* Toast Notification */}
            {toastMessage && <div className={styles.toast}>{toastMessage}</div>}
        </div>
    );
};

export default CustomerSubscriptions;