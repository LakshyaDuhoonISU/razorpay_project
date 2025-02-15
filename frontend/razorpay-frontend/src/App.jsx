import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Signup from './components/Signup';
import Login from './components/Login';
import { AuthProvider } from './components/AuthContext';
import Dashboard from './components/Dashboard';
import Customers from './components/Customers';
import Subscriptions from './components/Subscriptions';
import Plans from './components/Plans';
import Transactions from './components/Transactions';
import PaymentForm from './components/PaymentForm';
import client from './apolloClient';
import { ApolloProvider } from '@apollo/client';
import Auth from './hoc/Auth';
import HomePage from './components/HomePage';
import CustomerLogin from './components/CustomerComponents/CustomerLogin';
import CustomerDashboard from './components/CustomerComponents/CustomerDashboard';
import { CustomerProvider } from './components/CustomerComponents/CustomerContext';
import CustomerSubscriptions from './components/CustomerComponents/CustomerSubscriptions';
import CustomerTransactions from './components/CustomerComponents/CustomerTransactions';
import CustAuth from './hoc/CustAuth';

const App = () => (
  <AuthProvider>
    <CustomerProvider>
      <ApolloProvider client={client}>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/custlogin" element={<CustomerLogin />} />
            <Route path="/custdashboard" element={<CustAuth children={<CustomerDashboard />} />} />
            <Route path="/custsubscriptions" element={<CustAuth children={<CustomerSubscriptions />} />} />
            <Route path="/custtransactions" element={<CustAuth children={<CustomerTransactions />} />} />
            <Route path="/payment" element={<CustAuth children={<PaymentForm />} />} />
            <Route path="/register" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Auth children={<Dashboard />} />} />
            <Route path="/customers" element={<Auth children={<Customers />} />} />
            <Route path="/subscriptions" element={<Auth children={<Subscriptions />} />} />
            <Route path="/plans" element={<Auth children={<Plans />} />} />
            <Route path="/transactions" element={<Auth children={<Transactions />} />} />
          </Routes>
        </Router>
      </ApolloProvider>
    </CustomerProvider>
  </AuthProvider>
);

export default App;