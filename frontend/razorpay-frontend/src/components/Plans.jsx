import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Box, Drawer, List, ListItem, ListItemText, IconButton, AppBar, Toolbar, Typography, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link } from 'react-router-dom';
import styles from './Plans.module.css';

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
                setSuccessMessage('Plan added successfully!');
                setToastMessage('Plan added successfully!');
                setToastError(false); // Set as success
                setFormData({ name: '', description: '', price: '', duration: '', businessId: businessId }); // Reset form
                setShowForm(false); // Hide form
                setTimeout(() => {
                    setToastMessage('');
                }, 5000);
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to add plan');
                setToastMessage(errorData.message || 'Failed to add plan');
                setToastError(false); // Set as success
                setTimeout(() => {
                    setToastMessage('');
                }, 5000);
            }
        } catch (error) {
            console.error('Error adding plan:', error);
            setError('An error occurred while adding the plan');
            setToastMessage('An error occurred while adding the plan');
            setToastError(false); // Set as success
            setTimeout(() => {
                setToastMessage('');
            }, 5000);
        }
    };

    const handleEditPlan = async (planId) => {
        const planToEdit = plans.find((plan) => plan._id === planId);
        setFormData(planToEdit);
        setShowForm(true);
    };

    const handleDeletePlan = async (planId) => {
        try {
            const response = await fetch(`http://localhost:8000/api/plans/${planId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                },
            });

            if (response.ok) {
                setPlans(plans.filter((plan) => plan._id !== planId));
                setSuccessMessage('Plan deleted successfully!');
                setToastMessage('Plan deleted successfully!');
                setToastError(false); // Set as success
                setTimeout(() => {
                    setToastMessage('');
                }, 5000);
            } else {
                console.error('Failed to delete plan');
            }
        } catch (error) {
            console.error('Error deleting plan:', error);
            setToastMessage('An error occurred while deleting the plan');
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

                {showForm && (
                    <form className={styles.form} onSubmit={handleAddPlan}>
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

                {/* {successMessage && <p className={styles.success}>{successMessage}</p>}
                {error && <p className={styles.error}>{error}</p>} */}

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
                            <button onClick={() => handleDeletePlan(plan._id)} className={styles.deleteButton}>
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

export default Plans;
