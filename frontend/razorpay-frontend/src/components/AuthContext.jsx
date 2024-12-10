import React, { createContext, useContext, useState } from 'react';
import { auth } from '../firebaseConfig'; // Firebase auth

const AuthContext = createContext();

// Custom hook to use the AuthContext
export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [idToken, setIdToken] = useState(localStorage.getItem('authToken') || '');
    const [businessId, setBusinessId] = useState(localStorage.getItem('businessId') || ''); // State to store businessId

    // Refresh ID token if expired
    const getFreshIdToken = async () => {
        const user = auth.currentUser;
        if (user) {
            const freshToken = await user.getIdToken(true); // Force token refresh
            setIdToken(freshToken); // Store the fresh token in the context
            localStorage.setItem('authToken', freshToken); // Persist token in localStorage
            return freshToken;
        }
        throw new Error('User is not authenticated');
    };

    const login = (token) => {
        setIdToken(token);
        localStorage.setItem('authToken', token); // Store token in localStorage for persistence
    };

    const logout = () => {
        setIdToken('');
        localStorage.removeItem('authToken'); // Clear token from localStorage
    };

    const updateBusinessId = (id) => {
        setBusinessId(id);
        localStorage.setItem('businessId', id);
    };

    return (
        <AuthContext.Provider value={{ idToken, login, logout, getFreshIdToken, businessId, updateBusinessId }}>
            {children}
        </AuthContext.Provider>
    );
};
