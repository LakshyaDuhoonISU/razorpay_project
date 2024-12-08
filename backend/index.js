import express from 'express';
import cors from 'cors';
import connectDB from './dbConnection.js';
import authMiddleware from './middlewares/authMiddleware.js';

import customerRoutes from './routes/customerRoutes.js';
import planRoutes from './routes/planRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import businessRoutes from './routes/businessRoutes.js';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { typeDefs, resolvers } from './graphql/index.js';

// connect to database
connectDB();

// create express app
const app = express();
app.use(express.json());

// enable cors (to allow requests from frontend)
app.use(cors());

// auth route
app.use('/api/businesses', businessRoutes);

// middleware
app.use(authMiddleware);

// routes
app.use('/api/customers', customerRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/plans', planRoutes);

// Apollo Server for GraphQL
const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.replace('Bearer ', '');
        return { token };
    },
});

await apolloServer.start();

app.use('/graphql', expressMiddleware(apolloServer))

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error for debugging
    res.status(500).send({
        error: 'Internal Server Error',
        message: err.message,
    });
});

app.listen(8000, () => {
    console.log('Server is running on port 8000');
})