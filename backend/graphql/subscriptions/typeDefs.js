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
        ): Subscription!
        deleteSubscription(id: ID!): String!
    }
`;
