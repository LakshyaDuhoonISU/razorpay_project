import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Box, Drawer, List, ListItem, ListItemText, IconButton, AppBar, Toolbar, Typography, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { gql } from 'graphql-tag';
import styles from './Plans.module.css';

// Define GraphQL mutation to update a plan
const UPDATE_PLAN = gql`
  mutation UpdatePlan($id: ID!, $name: String, $description: String, $price: Float, $duration: Int) {
    updatePlan(id: $id, name: $name, description: $description, price: $price, duration: $duration) {
      id
      name
      description
      price
      duration
    }
  }
`;

// Define GraphQL mutation to delete a plan
const DELETE_PLAN = gql`
  mutation DeletePlan($id: ID!) {
    deletePlan(id: $id)
  }
`;

function Plans() {
    const { idToken, businessId } = useAuth();
    const [plans, setPlans] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        duration: '',
        businessId: businessId,
    });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [drawerOpen, setDrawerOpen] = useState(false); // State to toggle Drawer
    const [toastMessage, setToastMessage] = useState(''); // State for toast message
    const [toastError, setToastError] = useState(false); // State for error type in toast

    // GraphQL mutations
    const [updatePlan] = useMutation(UPDATE_PLAN);
    const [deletePlan] = useMutation(DELETE_PLAN);

    // Dialog management for deletion confirmation
    const [openDialog, setOpenDialog] = useState(false);
    const [planToDelete, setPlanToDelete] = useState(null); // Store the plan ID for deletion

    useEffect(() => {
        const storedBusinessId = localStorage.getItem('businessId');
        if (!businessId && storedBusinessId) {
            fetchPlans(storedBusinessId);
        } else if (businessId) {
            fetchPlans(businessId);
        }
    }, [businessId]);

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
                setPlans(data.data); // Set the fetched plans
            } else {
                console.error('Failed to fetch plans');
            }
        } catch (error) {
            console.error('Error fetching plans:', error);
        }
    };

    const handleAddPlan = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8000/api/plans', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();
                setPlans((prevPlans) => [...prevPlans, data.data]); // Add the new plan to the list
                setToastMessage('Plan added successfully!');
                setToastError(false);
                setFormData({ name: '', description: '', price: '', duration: '', businessId: businessId });
                setShowForm(false); // Hide form
                setTimeout(() => {
                    setToastMessage('');
                }, 5000);
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to add plan');
                setToastMessage(errorData.message || 'Failed to add plan');
                setToastError(true);
                setTimeout(() => {
                    setToastMessage('');
                }, 5000);
            }
        } catch (error) {
            console.error('Error adding plan:', error);
            setError('An error occurred while adding the plan');
            setToastMessage('An error occurred while adding the plan');
            setToastError(true);
            setTimeout(() => {
                setToastMessage('');
            }, 5000);
        }
    };

    const handleEditPlan = (planId) => {
        const planToEdit = plans.find((plan) => plan._id === planId);
        setFormData(planToEdit);
        setShowForm(true);
    };

    const handleUpdatePlan = async (e) => {
        e.preventDefault();
        try {
            const { data } = await updatePlan({
                variables: {
                    id: formData._id,
                    name: formData.name,
                    description: formData.description,
                    price: parseFloat(formData.price),
                    duration: parseInt(formData.duration),
                },
            });

            setPlans((prevPlans) =>
                prevPlans.map((plan) => (plan._id === formData._id ? { ...plan, ...data.updatePlan } : plan))
            );

            setToastMessage('Plan updated successfully!');
            setToastError(false);
            setShowForm(false); // Close form
            setTimeout(() => {
                setToastMessage('');
            }, 5000);
        } catch (error) {
            console.log(error)
            setToastMessage('Failed to update plan');
            setToastError(true);
            setTimeout(() => {
                setToastMessage('');
            }, 5000);
        }
    };

    // Handle delete confirmation
    const openConfirmationDialog = (planId) => {
        setPlanToDelete(planId);
        setOpenDialog(true);
    };

    const cancelDelete = () => {
        setOpenDialog(false);
    };

    const handleDeletePlan = async () => {
        try {
            await deletePlan({
                variables: { id: planToDelete },
            });

            setPlans(plans.filter((plan) => plan._id !== planToDelete));
            setToastMessage('Plan deleted successfully!');
            setToastError(false);
            setTimeout(() => {
                setToastMessage('');
            }, 5000);
            setOpenDialog(false); // Close dialog after deletion
        } catch (error) {
            console.error('Error deleting plan:', error);
            setToastMessage('Failed to delete plan');
            setToastError(true);
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
                        Plan Management
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
                        <ListItem button component={Link} to="/subscriptions">
                            <ListItemText primary="Subscriptions" />
                        </ListItem>
                        <ListItem button component={Link} to="/transactions">
                            <ListItemText primary="Transactions" />
                        </ListItem>
                    </List>
                </Box>
            </Drawer>

            {/* Main Content */}
            <Box className={styles.content}>
                <h2>Plans</h2>
                <button className={styles.addButton} onClick={() => setShowForm(true)}>
                    Add Plan
                </button>
                {plans.length === 0 ? (
                    <p className={styles.noSubs}>No plans found</p> // Display if there are no plans
                ) : null}
                {showForm && (
                    <form className={styles.form} onSubmit={formData._id ? handleUpdatePlan : handleAddPlan}>
                        <h3>{formData._id ? 'Edit Plan' : 'Add Plan'}</h3>
                        <input
                            type="text"
                            placeholder="Plan Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        <textarea
                            placeholder="Description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                            type="number"
                            placeholder="Duration (in days)"
                            value={formData.duration}
                            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                            required
                        />
                        <button type="submit" className={styles.saveButton}>
                            {formData._id ? 'Update Plan' : 'Add Plan'}
                        </button>
                        <button type="button" className={styles.cancelButton} onClick={() => setShowForm(false)}>
                            Cancel
                        </button>
                    </form>
                )}

                <ul className={styles.planList}>
                    {plans.map((plan) => (
                        <li key={plan._id} className={styles.planItem}>
                            <p>
                                <strong>Name:</strong> {plan.name}
                            </p>
                            <p>
                                <strong>Description:</strong> {plan.description}
                            </p>
                            <p>
                                <strong>Price:</strong> ${plan.price}
                            </p>
                            <p>
                                <strong>Duration:</strong> {plan.duration} days
                            </p>
                            <button onClick={() => handleEditPlan(plan._id)} className={styles.editButton}>
                                Edit
                            </button>
                            <button onClick={() => openConfirmationDialog(plan._id)} className={styles.deleteButton}>
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
                    <p>Are you sure you want to delete this plan?</p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={cancelDelete} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDeletePlan} color="secondary">
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

export default Plans;