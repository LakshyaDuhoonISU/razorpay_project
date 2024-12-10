import { gql } from 'apollo-server-express';

export const businessTypeDefs = gql`
    type Business {
        id: ID!
        name: String!
        email: String!
        phone: String!
        address: String
        firebaseUid: String!
        createdAt: String
        updatedAt: String
    }

    type Query {
        _empty: String
    }

    type Mutation {
        updateBusiness(id: ID!, name: String, email: String, phone: String, address: String): Business!
        deleteBusiness(id: ID!): String!
    }
`;