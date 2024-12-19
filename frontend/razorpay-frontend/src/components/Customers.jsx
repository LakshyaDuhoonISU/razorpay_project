import React, { useState, useEffect } from 'react';
import styles from './Customers.module.css';
import { useAuth } from './AuthContext';
import { Box, Drawer, List, ListItem, ListItemText, IconButton, AppBar, Toolbar, Typography, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { gql } from 'graphql-tag';

// Define GraphQL mutation to update a customer
const UPDATE_CUSTOMER = gql`
  mutation UpdateCustomer($id: ID!, $name: String, $email: String, $phone: String) {
    updateCustomer(id: $id, name: $name, email: $email, phone: $phone) {
      id
      name
      email
      phone
    }
  }
`;

// Define GraphQL mutation to delete a customer
const DELETE_CUSTOMER = gql`
  mutation DeleteCustomer($id: ID!) {
    deleteCustomer(id: $id)
  }
`;

function Customers() {
    const { idToken, businessId } = useAuth();
    const [customers, setCustomers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', businessId: businessId });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastError, setToastError] = useState(false);
    const navigate = useNavigate();

    // Using Apollo Client's useMutation hook to update and delete customers
    const [updateCustomer] = useMutation(UPDATE_CUSTOMER);
    const [deleteCustomer] = useMutation(DELETE_CUSTOMER);

    // State for managing the dialog
    const [openDialog, setOpenDialog] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState(null); // Store customer to be deleted

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
                setCustomers(data.data);
            } else if (response.status === 404) {
                setCustomers([]); // If no subscriptions, set as empty array
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
                setToastMessage('Customer added successfully!');
                setToastError(false);
                setFormData({ name: '', email: '', phone: '', businessId: businessId });
                setShowForm(false);
                setTimeout(() => {
                    setToastMessage('');
                }, 5000);
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to add customer');
                setToastMessage(errorData.message || 'Failed to add customer');
                setToastError(true);
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

    const handleEditCustomer = async (customerId) => {
        const customerToEdit = customers.find((customer) => customer._id === customerId);
        setFormData(customerToEdit);
        setShowForm(true);
    };

    const handleUpdateCustomer = async (e) => {
        e.preventDefault();

        try {
            const { data } = await updateCustomer({
                variables: {
                    id: formData._id,
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                },
            });

            setCustomers((prevCustomers) =>
                prevCustomers.map((customer) =>
                    customer._id === formData._id ? { ...customer, ...formData } : customer
                )
            );

            setToastMessage('Customer updated successfully!');
            setToastError(false);
            setShowForm(false);
            setTimeout(() => {
                setToastMessage('');
            }, 5000);

        } catch (error) {
            setToastMessage('Failed to update customer');
            console.log(error);
            setToastError(true);
            setTimeout(() => {
                setToastMessage('');
            }, 5000);
        }
    };

    const handleDeleteCustomer = async () => {
        try {
            await deleteCustomer({
                variables: { id: customerToDelete },
            });

            setCustomers(customers.filter((customer) => customer._id !== customerToDelete));
            setToastMessage('Customer deleted successfully!');
            setToastError(false);
            setTimeout(() => {
                setToastMessage('');
            }, 5000);
            setOpenDialog(false); // Close the dialog after deletion
        } catch (error) {
            console.error('Error deleting customer:', error);
            setToastMessage('Failed to delete customer');
            setToastError(true);
            setTimeout(() => {
                setToastMessage('');
            }, 5000);
        }
    };

    const toggleDrawer = (open) => () => {
        setDrawerOpen(open);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData._id) {
            handleUpdateCustomer(e);
        } else {
            handleAddCustomer(e);
        }
    };

    // Open the dialog to confirm deletion
    const openConfirmationDialog = (customerId) => {
        setCustomerToDelete(customerId);
        setOpenDialog(true);
    };

    const cancelDelete = () => {
        setOpenDialog(false);
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
                    <Typography variant="body1" sx={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
                        Back to Dashboard
                    </Typography>
                </Toolbar>
            </AppBar>

            {/* Sidebar */}
            <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
                <Box role="presentation" onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)} sx={{ width: 250 }}>
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
                {customers.length === 0 ? (
                    <p className={styles.noSubs}>No customers found</p> // Display if there are no customers
                ) : null}
                {showForm && (
                    <form className={styles.form} onSubmit={handleSubmit}>
                        <h3>{formData._id ? 'Edit Customer' : 'Add Customer'}</h3>
                        <input
                            type="text"
                            placeholder="Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Email"
                            className={styles.email}
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
                            maxLength={10}
                        />
                        <button type="submit" className={styles.saveButton}>
                            {formData._id ? 'Update Customer' : 'Add Customer'}
                        </button>
                        <button type="button" className={styles.cancelButton} onClick={() => setShowForm(false)}>
                            Cancel
                        </button>
                    </form>
                )}

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
                            <button onClick={() => openConfirmationDialog(customer._id)} className={styles.deleteButton}>
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
                    <p>Are you sure you want to delete this customer?</p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={cancelDelete} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteCustomer} color="secondary">
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

export default Customers;