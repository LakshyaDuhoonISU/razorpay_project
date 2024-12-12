import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Signup from './components/SignUp';
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

const App = () => (
  <AuthProvider>
    <ApolloProvider client={client}>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Auth children={<Dashboard />} />} />
          <Route path="/customers" element={<Auth children={<Customers />} />} />
          <Route path="/subscriptions" element={<Auth children={<Subscriptions />} />} />
          <Route path="/plans" element={<Auth children={<Plans />} />} />
          <Route path="/transactions" element={<Auth children={<Transactions />} />} />
          <Route path="/payment" element={<Auth children={<PaymentForm />} />} />
        </Routes>
      </Router>
    </ApolloProvider>
  </AuthProvider>
);

export default App;
