import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Box, Drawer, List, ListItem, ListItemText, IconButton, AppBar, Toolbar, Typography, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link } from 'react-router-dom';
import styles from './Subscriptions.module.css';

function Subscriptions() {
    const { idToken, businessId } = useAuth();
    const [subscriptions, setSubscriptions] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        customerId: '',
        planId: '',
        price: '',
        startDate: '',
        endDate: '',
        status: 'Active',
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
            fetchSubscriptions(storedBusinessId);
        } else if (businessId) {
            fetchSubscriptions(businessId);
        }
    }, [businessId]);

    const fetchSubscriptions = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/subscriptions', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setSubscriptions((prevSubscriptions)=>[...prevSubscriptions,data.data]);
            } else {
                console.error('Failed to fetch subscriptions');
            }
        } catch (error) {
            toast.error('Error fetching subscriptions', error);
        }
    };

    const handleAddSubscription = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8000/api/subscriptions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
                body: JSON.stringify({ ...formData, businessId }),
            });

            if (response.ok) {
                const data = await response.json();
                setSubscriptions((prevSubscriptions) => [...prevSubscriptions, data.data]);
                setSuccessMessage('Subscription added successfully!');
                setToastMessage('Subscription added successfully!');
                setToastError(false); // Set as success
                setFormData({ customerId: '', planId: '', price: '', startDate: '', endDate: '', status: 'Active', businessId: businessId });
                setShowForm(false);
                setTimeout(() => {
                    setToastMessage('');
                }, 5000);
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to add subscription');
                setToastMessage(errorData.message || 'Failed to add subscription');
                setToastError(false); // Set as success
                setTimeout(() => {
                    setToastMessage('');
                }, 5000);
            }
        } catch (error) {
            console.error('Error adding subscription:', error);
            setError('An error occurred while adding the subscription');
            setToastMessage('An error occurred while adding the subscription');
            setToastError(false); // Set as success
            setTimeout(() => {
                setToastMessage('');
            }, 5000);
        }
    };

    const handleEditSubscription = (subscriptionId) => {
        const subscriptionToEdit = subscriptions.find((subscription) => subscription._id === subscriptionId);
        setFormData(subscriptionToEdit);
        setShowForm(true);
    };

    const handleDeleteSubscription = async (subscriptionId) => {
        try {
            const response = await fetch(`http://localhost:8000/api/subscriptions/${subscriptionId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                },
            });

            if (response.ok) {
                setSubscriptions(subscriptions.filter((subscription) => subscription._id !== subscriptionId));
                setSuccessMessage('Plan deleted successfully!');
                setToastMessage('Plan deleted successfully!');
                setToastError(false); // Set as success
                setTimeout(() => {
                    setToastMessage('');
                }, 5000);
            } else {
                console.log('Failed to delete subscription');
            }
        } catch (error) {
            console.error('Error deleting subscription:', error);
            setToastMessage('An error occurred while deleting the subscription');
            setToastError(false); // Set as success
            setTimeout(() => {
                setToastMessage('');
            }, 5000);
        }
    };

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
                        Subscription Management
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
                        <ListItem button component={Link} to="/transactions">
                            <ListItemText primary="Transactions" />
                        </ListItem>
                    </List>
                </Box>
            </Drawer>

            {/* Main Content */}
            <Box className={styles.content}>
                <h2>Subscriptions</h2>
                <button className={styles.addButton} onClick={() => setShowForm(true)}>
                    Add Subscription
                </button>

                {showForm && (
                    <form className={styles.form} onSubmit={handleAddSubscription}>
                        <h3>{formData._id ? 'Edit Subscription' : 'Add Subscription'}</h3>
                        <input
                            type="text"
                            placeholder="Customer ID"
                            value={formData.customerId}
                            onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Plan ID"
                            value={formData.planId}
                            onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
                            required
                        />
                        <input
                            type="number"
                            placeholder="Price"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            required
                        />
                        <input
                            type="date"
                            placeholder="Start Date"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                        <input
                            type="date"
                            placeholder="End Date"
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="Active">Active</option>
                            <option value="Paused">Paused</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                        <button type="submit" className={styles.saveButton}>
                            {formData._id ? 'Update Subscription' : 'Add Subscription'}
                        </button>
                        <button type="button" className={styles.cancelButton} onClick={() => setShowForm(false)}>
                            Cancel
                        </button>
                    </form>
                )}

                <ul className={styles.subscriptionList}>
                    {subscriptions.map((subscription) => (
                        <li key={subscription._id} className={styles.subscriptionItem}>
                            <p>
                                <strong>Customer ID:</strong> {subscription.customerId}
                            </p>
                            <p>
                                <strong>Plan ID:</strong> {subscription.planId}
                            </p>
                            <p>
                                <strong>Price:</strong> ${subscription.price}
                            </p>
                            <p>
                                <strong>Status:</strong> {subscription.status}
                            </p>
                            <button onClick={() => handleEditSubscription(subscription._id)} className={styles.editButton}>
                                Edit
                            </button>
                            <button onClick={() => handleDeleteSubscription(subscription._id)} className={styles.deleteButton}>
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

export default Subscriptions;
