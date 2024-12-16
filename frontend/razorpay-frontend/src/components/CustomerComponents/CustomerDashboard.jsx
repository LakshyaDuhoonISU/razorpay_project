import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CustomerDashboard.module.css';
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemText,
    IconButton,
    AppBar,
    Toolbar,
    Typography,
    Button,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useCustomer } from './CustomerContext';

const CustomerDashboard = () => {
    const navigate = useNavigate();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const { customer, setCustomer } = useCustomer();
    // console.log('Customer:', customer);

    useEffect(() => {
        if (!customer) {
            navigate('/custlogin');
        }
    }, [customer, navigate]);

    const handleLogout = () => {
        setCustomer(null); // Clear customer data from context and localStorage
        navigate('/custlogin'); // Navigate back to the login page
    };

    const toggleDrawer = (open) => () => {
        setDrawerOpen(open);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            {/* App Bar */}
            <AppBar position="fixed">
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        onClick={toggleDrawer(true)}
                        sx={{ marginRight: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Customer Dashboard
                    </Typography>
                    <Button color="inherit" onClick={handleLogout}>
                        Logout
                    </Button>
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
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    marginTop: '64px',
                    padding: 2,
                    textAlign: 'center',
                }}
            >
                <div className={styles.card}>
                    <h1>Welcome to FlashPay</h1>
                    {customer ? (
                        <div>
                            <h2>Your Profile</h2>
                            <p>
                                <strong>Name:</strong> {customer.name}
                            </p>
                            <p>
                                <strong>Email:</strong> {customer.email}
                            </p>
                            <p>
                                <strong>Phone:</strong> {customer.phone}
                            </p>
                        </div>
                    ) : customer === null ? ( // Show loading message if `customer` is null
                        <p>Loading your profile...</p>
                    ) : (
                        <p>No customer data available. Please log in again.</p>
                    )}
                </div>
            </Box>
        </Box>
    );
};

export default CustomerDashboard;