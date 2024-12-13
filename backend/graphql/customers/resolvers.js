import Customer from "../../models/Customers.js";
import { session } from "../../neo4j.cjs";

export const customerResolvers = {
    Query: {
        _empty: () => "Empty query",
    },
    Mutation: {
        // Update customer details
        updateCustomer: async (_, { id, name, email, phone }) => {
            const customer = await Customer.findOne({ _id: id });

            if (!customer) {
                throw new Error("Customer not found or unauthorized");
            }

            // Check if customer exists
            const updatedCustomer = await Customer.findByIdAndUpdate(
                id,
                { name, email, phone },
                { new: true }
            );

            try {
                await session.run(
                    `
                    MATCH (c:Customer {id: $id})
                    SET c.name = $name, c.email = $email, c.phone = $phone
                    RETURN c
                    `,
                    { id, name, email, phone }
                );
            } catch (error) {
                console.error("Neo4j error: ", error);
            }

            return updatedCustomer;
        },

        // Delete customer profile
        deleteCustomer: async (_, { id }) => {

            // Find and delete the customer
            const customer = await Customer.findOne({ _id: id });

            if (!customer) {
                throw new Error("Customer not found or unauthorized");
            }

            try {
                await session.run(
                    `
                    MATCH (c:Customer {id: $id})
                    DETACH DELETE c
                    `,
                    { id }
                );
            } catch (error) {
                console.error("Neo4j error: ", error);
            }

            await Customer.findByIdAndDelete(id);
            return "Customer deleted successfully";
        }
    }
};