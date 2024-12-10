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

const App = () => (
  <AuthProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/payment" element={<PaymentForm />} />
      </Routes>
    </Router>
  </AuthProvider>
);

export default App;
