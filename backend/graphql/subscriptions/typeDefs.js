import { gql } from 'apollo-server-express';

export const subscriptionTypeDefs = gql`
    type Subscription {
        id: ID!
        customerId: ID!
        planName: String!
        price: Float!
        startDate: String
        endDate: String
        status: String!
        paymentId: ID!
        businessId: ID!
        createdAt: String
        updatedAt: String
    }

    type Mutation {
        updateSubscription(
            id: ID!
            planName: String
            price: Float
            startDate: String
            endDate: String
            status: String
        ): Subscription!
        deleteSubscription(id: ID!): String!
    }
`;
