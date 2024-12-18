import React, { createContext, useState, useContext, useEffect } from 'react';

const CustomerContext = createContext();

export const CustomerProvider = ({ children }) => {
    const [customer, setCustomer] = useState(() => {
        // Refetch customer state from localStorage if available
        const savedCustomer = localStorage.getItem('customer');
        return savedCustomer ? JSON.parse(savedCustomer) : null;
    });

    useEffect(() => {
        if (customer) {
            // Persist customer data in localStorage
            localStorage.setItem('customer', JSON.stringify(customer));
        } else {
            // Clear localStorage if customer is logged out
            localStorage.removeItem('customer');
        }
    }, [customer]);

    return (
        <CustomerContext.Provider value={{ customer, setCustomer }}>
            {children}
        </CustomerContext.Provider>
    );
};

export const useCustomer = () => useContext(CustomerContext);