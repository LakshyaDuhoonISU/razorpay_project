import Business from "../../models/Business.js";
import Customer from "../../models/Customers.js";
import Plan from "../../models/Plans.js";
import Transaction from "../../models/Transactions.js";
import Subscription from "../../models/Subscriptions.js";

export const businessResolvers = {
    Query: {
        _empty: () => "Empty query",
    },
    Mutation: {
        // Update business profile
        updateBusiness: async (_, { id, name, email, phone, address }, { businessId }) => {
            if (id !== businessId) {
                throw new Error("Unauthorized: Cannot delete another business's profile");
            }

            // Find business by id and update
            const updatedBusiness = await Business.findByIdAndUpdate(
                id,
                { name, email, phone, address },
                { new: true }
            );

            if (!updatedBusiness) {
                throw new Error("Business not found");
            }

            return updatedBusiness;
        },

        // Delete business profile with cascading deletes
        deleteBusiness: async (_, { id }, { businessId }) => {
            if (id !== businessId) {
                throw new Error("Unauthorized: Cannot delete another business's profile");
            }

            // Find the business to delete
            const business = await Business.findById(id);

            if (!business) {
                throw new Error("Business not found");
            }

            // Delete transactions associated with the business's customers
            const customers = await Customer.find({ businessId: id });
            const customerIds = customers.map((customer) => customer._id);
            await Transaction.deleteMany({ customerId: { $in: customerIds } });

            // Delete customers associated with the business
            await Customer.deleteMany({ businessId: id });

            // Delete plans associated with the business
            await Plan.deleteMany({ businessId: id });

            // Delete subscriptions associated with the business's customers
            await Subscription.deleteMany({ customerId: { $in: customerIds } });

            // Finally, delete the business
            await Business.findByIdAndDelete(id);

            return "Business and all associated data deleted successfully";
        }
    }
};