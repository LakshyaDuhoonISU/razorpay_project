import { gql } from 'apollo-server-express';

export const customerTypeDefs = gql`
    type Customer {
        id: ID!
        name: String!
        email: String!
        phone: String!
        businessId: ID!
        createdAt: String
        updatedAt: String
    }
        
    type Query {
        _empty: String
    }

    type Mutation {
        updateCustomer(id: ID!, name: String, email: String, phone: String): Customer!
        deleteCustomer(id: ID!): String!
    }
`;