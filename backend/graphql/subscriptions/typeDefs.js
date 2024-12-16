import { gql } from 'apollo-server-express';

export const subscriptionTypeDefs = gql`
    type Subscription {
        id: ID!
        customerId: ID!
        planId: ID!
        price: Float!
        startDate: String
        endDate: String
        businessId: ID!
        status: String!
        paymentStatus: String!
        createdAt: String
        updatedAt: String
    }

    type Query {
        _empty: String
    }

    type Mutation {
        updateSubscription(
            id: ID!
            planId: ID
            price: Float
            startDate: String
            endDate: String
            status: String
            paymentStatus: String
        ): Subscription!
        deleteSubscription(id: ID!): String!
    }
`;