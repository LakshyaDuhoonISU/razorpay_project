import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext'; // Use the useAuth hook to access the context
import { useNavigate, Link } from 'react-router-dom';
import styles from './Dashboard.module.css';
import { Box, Drawer, List, ListItem, ListItemText, IconButton, AppBar, Toolbar, Typography, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useMutation } from '@apollo/client';
import { gql } from 'graphql-tag';

function Dashboard() {
    const { idToken, logout, updateBusinessId } = useAuth(); // Access token and logout function from context
    const navigate = useNavigate(); // Used for programmatic navigation
    const [userData, setUserData] = useState({});
    const [drawerOpen, setDrawerOpen] = useState(false); // State to toggle Drawer
    const [isEditing, setIsEditing] = useState(false); // Track whether we're editing the profile

    const [updateBusiness] = useMutation(gql`
        mutation UpdateBusiness($id: ID!, $name: String, $phone: String, $address: String) {
            updateBusiness(id: $id, name: $name, phone: $phone, address: $address) {
                id
                name
                email
                phone
                address
            }
        }
    `);

    const [deleteBusiness] = useMutation(gql`
        mutation DeleteBusiness($id: ID!) {
            deleteBusiness(id: $id)
        }
    `);

    // State for confirmation dialog
    const [openDialog, setOpenDialog] = useState(false);
    const [profileToDelete, setProfileToDelete] = useState(null);

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
                setUserData(data.data);
                updateBusinessId(data.data._id); // Store the businessId in the context
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

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        fetchUserData(); // Fetch the original data again if cancelled
    };

    const handleSaveEdit = async () => {
        // console.log(userData._id);
        try {
            const { data } = await updateBusiness({
                variables: {
                    id: userData._id,
                    name: userData.name,
                    phone: userData.phone,
                    address: userData.address,
                },
            });

            setUserData(data.updateBusiness);
            setIsEditing(false);
            alert("Profile updated successfully!");
        } catch (error) {
            console.error("Error updating business profile:", error);
            alert("Failed to update profile.");
        }
    };

    const handleDelete = async () => {
        try {
            await deleteBusiness({ variables: { id: userData._id } });
            alert("Business profile and related data deleted successfully.");
            navigate('/login');
        } catch (error) {
            console.error("Error deleting business profile:", error);
            alert("Failed to delete profile.");
        }
    };

    const openDeleteDialog = (profileId) => {
        setProfileToDelete(profileId);
        setOpenDialog(true); // Open the confirmation dialog
    };

    const closeDeleteDialog = () => {
        setOpenDialog(false); // Close the dialog without deleting
    };

    const confirmDelete = () => {
        handleDelete(); // Proceed with deleting the profile
        setOpenDialog(false); // Close the dialog
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            {/* AppBar for header */}
            <AppBar position="fixed">
                <Toolbar>
                    <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer(true)} sx={{ marginRight: 2 }}>
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

            {/* Sidebar */}
            <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
                <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
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
                            <p><strong>Name:</strong> 
                                {isEditing ? 
                                    <input type="text" value={userData.name} onChange={(e) => setUserData({ ...userData, name: e.target.value })} />
                                    : userData.name}
                            </p>
                            <p><strong>Email:</strong> {userData.email}</p>
                            <p><strong>Phone:</strong> 
                                {isEditing ? 
                                    <input type="text" value={userData.phone} onChange={(e) => setUserData({ ...userData, phone: e.target.value })} />
                                    : userData.phone}
                            </p>
                            <p><strong>Address:</strong> 
                                {isEditing ? 
                                    <input type="text" value={userData.address} onChange={(e) => setUserData({ ...userData, address: e.target.value })} />
                                    : userData.address}
                            </p>

                            <div className={styles.actions}>
                                {isEditing ? (
                                    <>
                                        <button className={styles.saveButton} onClick={handleSaveEdit}>Save</button>
                                        <button className={styles.cancelButton} onClick={handleCancelEdit}>Cancel</button>
                                    </>
                                ) : (
                                    <button className={styles.editButton} onClick={handleEdit}>Edit Profile</button>
                                )}
                                <button className={styles.deleteButton} onClick={() => openDeleteDialog(userData.id)}>Delete Profile</button>
                            </div>
                        </div>
                    ) : (
                        <p>Loading your profile...</p>
                    )}
                </div>
            </Box>

            {/* Confirmation Dialog */}
            <Dialog open={openDialog} onClose={closeDeleteDialog}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <p>Are you sure you want to delete this business profile? This action cannot be undone.</p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDeleteDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={confirmDelete} color="secondary">
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default Dashboard;
