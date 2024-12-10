import { gql } from 'apollo-server-express';

export const planTypeDefs = gql`
    type Plan {
        id: ID!
        name: String!
        description: String
        price: Float!
        duration: Int!
        businessId: ID!
        createdAt: String
        updatedAt: String
    }

    type Query {
        _empty: String
    }

    type Mutation {
        updatePlan(id: ID!, name: String, description: String, price: Float, duration: Int): Plan!
        deletePlan(id: ID!): String!
    }
`;
