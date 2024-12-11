import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Box, Drawer, List, ListItem, ListItemText, IconButton, AppBar, Toolbar, Typography, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { gql } from 'graphql-tag';
import styles from './Subscriptions.module.css';

// GraphQL mutations for update and delete subscription
// const UPDATE_SUBSCRIPTION = gql`
//   mutation UpdateSubscription($id: ID!, $planId: ID, $price: Float, $startDate: String, $endDate: String, $status: String, $method: String) {
//     updateSubscription(id: $id, planId: $planId, price: $price, startDate: $startDate, endDate: $endDate, status: $status, method: $method) {
//       id
//       customerId
//       planId
//       price
//       startDate
//       endDate
//       status
//       method
//     }
//   }
// `;

const DELETE_SUBSCRIPTION = gql`
  mutation DeleteSubscription($id: ID!) {
    deleteSubscription(id: $id)
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
        businessId: businessId,
    });
    const [toastMessage, setToastMessage] = useState('');
    const [toastError, setToastError] = useState(false);

    // const [updateSubscription] = useMutation(UPDATE_SUBSCRIPTION);
    const [deleteSubscription] = useMutation(DELETE_SUBSCRIPTION);

    const [openDialog, setOpenDialog] = useState(false);
    const [subscriptionToDelete, setSubscriptionToDelete] = useState(null);

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

    // Handle plan change: update price when a plan is selected
    const handlePlanChange = (planId) => {
        const selectedPlan = plans.find((plan) => plan._id === planId);
        setFormData({
            ...formData,
            planId,
            price: selectedPlan ? selectedPlan.price : '', // Set price from the selected plan
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
                setFormData({
                    customerId: '',
                    planId: '',
                    price: '',
                    startDate: '',
                    endDate: '',
                    businessId: businessId,
                });
                setShowForm(false);
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

    // // Handle update subscription
    // const handleUpdateSubscription = async () => {
    //     try {
    //         const { data } = await updateSubscription({
    //             variables: {
    //                 id: formData._id,
    //                 planId: formData.planId,
    //                 price: parseFloat(formData.price),
    //                 startDate: formData.startDate,
    //                 endDate: formData.endDate,
    //                 status: formData.status,
    //                 method: formData.method,
    //             },
    //         });

    //         setSubscriptions(subscriptions.map(subscription => subscription._id === formData._id ? data.updateSubscription : subscription));
    //         fetchSubscriptions(); // Refetch subscriptions
    //         setToastMessage('Subscription updated successfully!');
    //         setToastError(false);
    //         setShowForm(false);
    //         setTimeout(() => {
    //             setToastMessage('');
    //         }, 5000);
    //     } catch (error) {
    //         console.error('Error updating subscription:', error);
    //         setToastMessage('Failed to update subscription');
    //         setToastError(true);
    //         setTimeout(() => {
    //             setToastMessage('');
    //         }, 5000);
    //     }
    // };

    // // Handle edit subscription logic
    // const handleEditSubscription = (subscriptionId) => {
    //     const subscriptionToEdit = subscriptions.find((subscription) => subscription._id === subscriptionId);
    //     setFormData({
    //         ...subscriptionToEdit,
    //         startDate: subscriptionToEdit.startDate ? new Date(subscriptionToEdit.startDate).toLocaleDateString() : '',
    //         endDate: subscriptionToEdit.endDate ? new Date(subscriptionToEdit.endDate).toLocaleDateString() : '',
    //     });
    //     setShowForm(true);
    // };

    // Handle delete subscription with confirmation dialog
    const openConfirmationDialog = (subscriptionId) => {
        setSubscriptionToDelete(subscriptionId);
        setOpenDialog(true); // Open the confirmation dialog
    };

    const handleDeleteSubscription = async () => {
        try {
            await deleteSubscription({
                variables: { id: subscriptionToDelete },
            });

            setSubscriptions(subscriptions.filter((subscription) => subscription._id !== subscriptionToDelete));
            setToastMessage('Subscription deleted successfully!');
            setToastError(false);
            setTimeout(() => {
                setToastMessage('');
            }, 5000);

            setOpenDialog(false); // Close the dialog
        } catch (error) {
            console.error('Error deleting subscription:', error);
            setToastMessage('Failed to delete subscription');
            setToastError(true);
            setTimeout(() => {
                setToastMessage('');
            }, 5000);
        }
    };

    const cancelDelete = () => {
        setOpenDialog(false); // Close the dialog without deleting
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
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            required
                        />
                        <input
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="Price"
                            value={formData.price}
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
                            {/* <button onClick={() => handleEditSubscription(subscription._id)} className={styles.editButton}>
                                Edit
                            </button> */}
                            <button onClick={() => openConfirmationDialog(subscription._id)} className={styles.deleteButton}>
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>
            </Box>

            {/* Confirmation Dialog */}
            <Dialog open={openDialog} onClose={cancelDelete}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <p>Are you sure you want to delete this subscription?</p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={cancelDelete} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteSubscription} color="secondary">
                        Confirm
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
