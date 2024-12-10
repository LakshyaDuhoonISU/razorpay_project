// src/components/Customers.jsx
import React, { useState, useEffect } from 'react';
import styles from './Customers.module.css';
import { useAuth } from './AuthContext';
import { Box, Drawer, List, ListItem, ListItemText, IconButton, AppBar, Toolbar, Typography, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link } from 'react-router-dom';

function Customers() {
    const { idToken, businessId } = useAuth();
    const [customers, setCustomers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', businessId: businessId });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [drawerOpen, setDrawerOpen] = useState(false); // State to toggle Drawer
    const [toastMessage, setToastMessage] = useState(''); // State for toast message
    const [toastError, setToastError] = useState(false); // State for error type in toast

    useEffect(() => {
        const storedBusinessId = localStorage.getItem('businessId');
        if (!businessId && storedBusinessId) {
            fetchCustomers(storedBusinessId);
        } else if (businessId) {
            fetchCustomers(businessId);
        }
    }, [businessId]);

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
                // console.log(businessId);
                setCustomers(data.data);
            } else {
                console.error('Failed to fetch customers');
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    };

    const handleAddCustomer = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8000/api/customers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();
                setCustomers(prevCustomers => [...prevCustomers, data.data]); // Append new customer to the list
                setSuccessMessage('Customer added successfully!');
                // console.log("New customer data:", data);
                setToastMessage('Customer added successfully!');
                setToastError(false); // Set as success
                setFormData({ name: '', email: '', phone: '', businessId: businessId }); // Reset form
                setShowForm(false); // Hide form
                setTimeout(() => {
                    setToastMessage('');
                }, 5000);
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to add customer');
                setToastMessage(errorData.message || 'Failed to add customer');
                setToastError(true); // Set as error
                setTimeout(() => {
                    setToastMessage('');
                }, 5000);
            }
        } catch (error) {
            console.error('Error adding customer:', error);
            setError('An error occurred while adding the customer');
            setToastMessage('An error occurred while adding the customer');
            setToastError(true);
            setTimeout(() => {
                setToastMessage('');
            }, 5000);
        }
    };

    const handleDeleteCustomer = async (customerId) => {
        try {
            const response = await fetch(`http://localhost:8000/api/customers/${customerId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                },
            });

            if (response.ok) {
                setCustomers(customers.filter((customer) => customer._id !== customerId));
                setToastMessage('Customer deleted successfully!');
                setToastError(false); // Set as success
                setTimeout(() => {
                    setToastMessage('');
                }, 5000);
            } else {
                console.error('Failed to delete customer');
            }
        } catch (error) {
            console.error('Error deleting customer:', error);
            setToastMessage('Failed to delete customer');
            setToastError(true); // Set as error
            setTimeout(() => {
                setToastMessage('');
            }, 5000);
        }
    };

    const handleEditCustomer = async (customerId) => {
        const customerToEdit = customers.find((customer) => customer._id === customerId);
        setFormData(customerToEdit);
        setShowForm(true);
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
                        Customer Management
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
                        <ListItem button component={Link} to="/plans">
                            <ListItemText primary="Plans" />
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
                <h2>Customers</h2>
                <button className={styles.addButton} onClick={() => setShowForm(true)}>
                    Add Customer
                </button>

                {showForm && (
                    <form className={styles.form} onSubmit={handleAddCustomer}>
                        <h3>{formData._id ? 'Edit Customer' : 'Add Customer'}</h3>
                        <input
                            type="text"
                            placeholder="Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            required
                        />
                        <button type="submit" className={styles.saveButton}>
                            {formData._id ? 'Update Customer' : 'Add Customer'}
                        </button>
                        <button type="button" className={styles.cancelButton} onClick={() => setShowForm(false)}>
                            Cancel
                        </button>
                    </form>
                )}

                {/* {successMessage && <p className={styles.success}>{successMessage}</p>} */}
                {/* {error && <p className={styles.error}>{error}</p>} */}

                <ul className={styles.customerList}>
                    {customers.map((customer) => (
                        <li key={customer._id} className={styles.customerItem}>
                            <p>
                                <strong>Name:</strong> {customer.name}
                            </p>
                            <p>
                                <strong>Email:</strong> {customer.email}
                            </p>
                            <p>
                                <strong>Phone:</strong> {customer.phone}
                            </p>
                            <button onClick={() => handleEditCustomer(customer._id)} className={styles.editButton}>
                                Edit
                            </button>
                            <button onClick={() => handleDeleteCustomer(customer._id)} className={styles.deleteButton}>
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

export default Customers;