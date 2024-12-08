import Customer from "../../models/Customers.js";

export const customerResolvers = {
    Mutation: {
        // Update customer details
        updateCustomer: async (_, { id, name, email, phone }) => {
            // Check if customer exists
            const updatedCustomer = await Customer.findByIdAndUpdate(
                id,
                { name, email, phone },
                { new: true }
            );

            if (!updatedCustomer) {
                throw new Error("Customer not found");
            }

            return updatedCustomer;
        },

        // Delete customer profile
        deleteCustomer: async (_, { id }) => {
            // Find and delete the customer
            const deletedCustomer = await Customer.findByIdAndDelete(id);

            if (!deletedCustomer) {
                throw new Error("Customer not found");
            }

            return "Customer deleted successfully";
        }
    }
};