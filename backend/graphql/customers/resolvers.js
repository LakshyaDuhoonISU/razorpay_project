import Customer from "../../models/Customers.js";

export const customerResolvers = {
    Query: {
        _empty: () => "Empty query",
    },
    Mutation: {
        // Update customer details
        updateCustomer: async (_, { id, name, email, phone }, { businessId }) => {
            const customer = await Customer.findOne({ _id: id, businessId });

            if (!customer) {
                throw new Error("Customer not found or unauthorized");
            }

            // Check if customer exists
            const updatedCustomer = await Customer.findByIdAndUpdate(
                id,
                { name, email, phone },
                { new: true }
            );

            return updatedCustomer;
        },

        // Delete customer profile
        deleteCustomer: async (_, { id }, { businessId }) => {

            // Find and delete the customer
            const customer = await Customer.findOne({ _id: id, businessId });

            if (!customer) {
                throw new Error("Customer not found or unauthorized");
            }

            await Customer.findByIdAndDelete(id);
            return "Customer deleted successfully";
        }
    }
};