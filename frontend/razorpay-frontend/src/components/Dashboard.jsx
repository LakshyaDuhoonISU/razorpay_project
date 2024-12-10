// src/components/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext'; // Use the useAuth hook to access the context
import { useNavigate, Link } from 'react-router-dom';
import styles from './Dashboard.module.css';
import { Box, Drawer, List, ListItem, ListItemText, IconButton, AppBar, Toolbar, Typography, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

function Dashboard() {
    const { idToken, logout, updateBusinessId } = useAuth(); // Access token and logout function from context
    const navigate = useNavigate(); // Used for programmatic navigation
    const [userData, setUserData] = useState({});
    const [drawerOpen, setDrawerOpen] = useState(false); // State to toggle Drawer

    // Redirect the user if no token exists (meaning the user is not logged in)
    useEffect(() => {
        if (!idToken) {
            navigate('/login'); // Redirect to login page if not authenticated
        } else {
            // Fetch user data or other necessary data from backend if required
            fetchUserData();
        }
    }, [idToken, navigate]);

    const fetchUserData = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/businesses/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${idToken}`, // Pass the token in the request header
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log(idToken)
                setUserData(data.data);
                updateBusinessId(data.data._id); // Store the businessId in the context
                // console.log(data.data)
            } else {
                console.error('Failed to fetch user data');
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    const handleLogout = () => {
        logout(); // Call logout to clear the token
        navigate('/login'); // Redirect to login after logout
    };

    const toggleDrawer = (open) => () => {
        setDrawerOpen(open);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            {/* AppBar for header */}
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
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Dashboard
                    </Typography>
                    <Button color="inherit" onClick={handleLogout}>
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>

            {/* Sidebar Drawer */}
            <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
                <Box
                    sx={{ width: 250 }}
                    role="presentation"
                    onClick={toggleDrawer(false)}
                    onKeyDown={toggleDrawer(false)}
                >
                    <List>
                        <ListItem button component={Link} to="/customers">
                            <ListItemText primary="Customers" />
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
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    marginTop: '64px', // To offset the AppBar
                    padding: 2,
                    textAlign: 'center',
                }}
            >
                <div className={styles.card}>
                    <h1>Welcome to your Dashboard</h1>
                    {userData ? (
                        <div>
                            <h2>Business Profile</h2>
                            <p><strong>Name:</strong> {userData.name}</p>
                            <p><strong>Email:</strong> {userData.email}</p>
                            <p><strong>Phone:</strong> {userData.phone}</p>
                            <p><strong>Address:</strong> {userData.address}</p>
                            <div className={styles.actions}>
                                <button className={styles.editButton}>Edit Profile</button>
                                <button className={styles.deleteButton}>Delete Profile</button>
                            </div>
                        </div>
                    ) : (
                        <p>Loading your profile...</p>
                    )}
                </div>
            </Box>
        </Box>
    );
}

export default Dashboard;
