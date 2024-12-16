import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Box, Drawer, List, ListItem, ListItemText, IconButton, AppBar, Toolbar, Typography, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { gql } from 'graphql-tag';
import styles from './Subscriptions.module.css';

// GraphQL mutations for update and delete subscription
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

function Subscriptions() {
    const { idToken, businessId } = useAuth();
    const [subscriptions, setSubscriptions] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [drawerOpen, setDrawerOpen] = useState(false); // State to toggle Drawer
    const [plans, setPlans] = useState([]);
    const [formData, setFormData] = useState({
        customerId: '',
        planId: '',
        price: '',
        startDate: '',
        endDate: '',
        status: 'active',
        businessId: businessId,
    });
    const [toastMessage, setToastMessage] = useState('');
    const [toastError, setToastError] = useState(false);
    const navigate = useNavigate();

    const [updateSubscription] = useMutation(UPDATE_SUBSCRIPTION);

    const [openDialog, setOpenDialog] = useState(false);

    useEffect(() => {
        const storedBusinessId = localStorage.getItem('businessId');
        if (!businessId && storedBusinessId) {
            fetchSubscriptions(storedBusinessId);
            fetchCustomers(storedBusinessId);
            fetchPlans(storedBusinessId);
        } else if (businessId) {
            fetchSubscriptions(businessId);
            fetchCustomers(businessId);
            fetchPlans(businessId);
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
                setSubscriptions(data.data);
            } else if (response.status === 404) {
                setSubscriptions([]); // If no subscriptions, set as empty array
            } else {
                console.error('Failed to fetch subscriptions');
            }
        } catch (error) {
            console.log('Error fetching subscriptions', error);
        }
    };

    const fetchCustomers = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/customers/', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setCustomers(data.data);
            } else {
                console.error('Failed to fetch customers');
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    };

    const fetchPlans = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/plans/business', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setPlans(data.data);
            } else {
                console.error('Failed to fetch plans');
            }
        } catch (error) {
            console.error('Error fetching plans:', error);
        }
    };

    // Handle form submission - add or update subscription
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData._id) {
            handleUpdateSubscription();  // If there's an _id, we are updating
        } else {
            handleAddSubscription();  // If there's no _id, we are adding
        }
    };

    // Handle start date change
    const handleStartDateChange = (startDate) => {
        const selectedPlan = plans.find((plan) => plan._id === formData.planId);
        const duration = selectedPlan ? selectedPlan.duration : 0;
        const calculatedEndDate = startDate
            ? new Date(new Date(startDate).setDate(new Date(startDate).getDate() + duration)).toISOString().split('T')[0]
            : '';

        setFormData({
            ...formData,
            startDate,
            endDate: calculatedEndDate, // Automatically calculate the end date
        });
    };

    // Handle plan change: update price when a plan is selected
    const handlePlanChange = (planId) => {
        const selectedPlan = plans.find((plan) => plan._id === planId);
        const duration = selectedPlan ? selectedPlan.duration : 0;
        const calculatedEndDate = formData.startDate
            ? new Date(new Date(formData.startDate).setDate(new Date(formData.startDate).getDate() + duration)).toISOString().split('T')[0]
            : '';
        setFormData({
            ...formData,
            planId,
            price: selectedPlan ? selectedPlan.price : '', // Set price from the selected plan
            endDate: calculatedEndDate, // Automatically calculate the end date
        });
    };

    const handleAddSubscription = async () => {
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
                setToastMessage('Subscription added successfully!');
                setToastError(false);
                // Navigate to the payment form after subscription is added
                setFormData({
                    customerId: '',
                    planId: '',
                    price: '',
                    startDate: '',
                    endDate: '',
                    status: 'active',
                    businessId: businessId,
                });
                setShowForm(false);
                navigate('/payment', {
                    state: {
                        subscriptionId: data.data._id,
                        amount: data.data.price,
                        customerId: data.data.customerId,
                        planId: data.data.planId,
                        businessId
                    },
                });
                setTimeout(() => {
                    setToastMessage('');
                }, 5000);
            } else {
                const errorData = await response.json();
                setToastMessage(errorData.message || 'Failed to add subscription');
                setToastError(true);
                setTimeout(() => {
                    setToastMessage('');
                }, 5000);
            }
        } catch (error) {
            console.error('Error adding subscription:', error);
            setToastMessage('An error occurred while adding the subscription');
            setToastError(true);
            setTimeout(() => {
                setToastMessage('');
            }, 5000);
        }
    };

    // Handle update subscription
    const handleUpdateSubscription = async () => {
        try {
            const { data } = await updateSubscription({
                variables: {
                    id: formData._id,
                    status: 'cancelled'
                },
            });

            setSubscriptions(subscriptions.map(subscription => subscription._id === formData._id ? data.updateSubscription : subscription));
            fetchSubscriptions(); // Refetch subscriptions
            setToastMessage('Subscription updated successfully!');
            setToastError(false);
            setShowForm(false);
            setTimeout(() => {
                setToastMessage('');
            }, 5000);
        } catch (error) {
            console.error('Error updating subscription:', error.message);
            setToastMessage('Failed to update subscription');
            setToastError(true);
            setTimeout(() => {
                setToastMessage('');
            }, 5000);
        }
    };

    const handleEditSubscription = (subscriptionId) => {
        const subscriptionToEdit = subscriptions.find((subscription) => subscription._id === subscriptionId);
        setFormData({
            ...subscriptionToEdit,
        });

        setOpenDialog(true); // Show confirmation dialog
    };

    // Inside the confirmation dialog handler:
    const confirmCancelSubscription = async () => {
        try {
            console.log("Mutation Input:", { id: formData._id, status: 'cancelled' });
            const { data } = await updateSubscription({
                variables: {
                    id: formData._id, // Only id and status are sent
                    status: 'cancelled',
                },
            });

            // Update the local state
            setSubscriptions(subscriptions.map((subscription) =>
                subscription._id === formData._id
                    ? { ...subscription, status: 'cancelled' }
                    : subscription
            ));
            setToastMessage('Subscription cancelled successfully!');
            setToastError(false);
        } catch (error) {
            console.error('Error cancelling subscription:', error.message);
            setToastMessage('Failed to cancel subscription');
            setToastError(true);
        } finally {
            setOpenDialog(false); // Close dialog
            setTimeout(() => setToastMessage(''), 5000);
        }
    };

    const cancelDelete = () => {
        setOpenDialog(false); // Close the dialog without cancelling
    };

    const toggleDrawer = (open) => () => {
        setDrawerOpen(open);
    };

    return (
        <div className={styles.container}>
            {/* App Bar */}
            <AppBar position="fixed">
                <Toolbar>
                    <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer(true)} sx={{ mr: 2 }}>
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Subscription Management
                    </Typography>
                </Toolbar>
            </AppBar>

            {/* Sidebar */}
            <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
                <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
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
                {subscriptions.length === 0 ? (
                    <p className={styles.noSubs}>No subscriptions found</p> // Display if there are no subscriptions
                ) : null}
                {showForm && (
                    <form className={styles.form} onSubmit={handleSubmit}>
                        <h3>Add Subscription</h3>
                        <select
                            value={formData.customerId}
                            onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                            required
                        >
                            <option value="">Select Customer</option>
                            {customers.map((customer) => (
                                <option key={customer._id} value={customer._id}>
                                    {customer.name}
                                </option>
                            ))}
                        </select>
                        <select
                            value={formData.planId}
                            onChange={(e) => handlePlanChange(e.target.value)}
                            required
                        >
                            <option value="">Select Plan</option>
                            {plans.map((plan) => (
                                <option key={plan._id} value={plan._id}>
                                    {plan.name}
                                </option>
                            ))}
                        </select>
                        <input
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => handleStartDateChange(e.target.value)}
                            required
                        />
                        <input
                            type="date"
                            value={formData.endDate}
                            readOnly
                        />
                        <input
                            type="number"
                            placeholder="Price"
                            value={formData.price}
                            readOnly
                        />
                        <input
                            type="text"
                            placeholder="active"
                            value={formData.status}
                            readOnly
                        />
                        <button type="submit" className={styles.saveButton}>
                            Add Subscription
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
                                <strong>Customer:</strong> {subscription.customerId?.name || "N/A"}
                            </p>
                            <p>
                                <strong>Plan:</strong> {subscription.planId?.name || "N/A"}
                            </p>
                            <p>
                                <strong>Start Date:</strong> {subscription.startDate ? new Date(subscription.startDate).toLocaleDateString() : "N/A"}
                            </p>
                            <p>
                                <strong>End Date:</strong> {subscription.endDate ? new Date(subscription.endDate).toLocaleDateString() : "Ongoing"}
                            </p>
                            <p>
                                <strong>Price: $</strong> {subscription.price || "Unknown"}
                            </p>
                            <p>
                                <strong>Status: </strong> {subscription.status || "Active"}
                            </p>
                            {/* Show the cancel button only if the status is "active" */}
                            {subscription.status === 'active' && (
                                <button onClick={() => handleEditSubscription(subscription._id)} className={styles.deleteButton}>
                                    Cancel
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            </Box>

            {/* Confirmation Dialog */}
            <Dialog open={openDialog} onClose={cancelDelete}>
                <DialogTitle>Confirm Cancellation</DialogTitle>
                <DialogContent>
                    <p>Are you sure you want to cancel this subscription?</p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={cancelDelete} color="primary">
                        No
                    </Button>
                    <Button onClick={confirmCancelSubscription} color="secondary">
                        Yes, Cancel
                    </Button>
                </DialogActions>
            </Dialog>

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