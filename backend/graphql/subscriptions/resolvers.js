import Subscription from "../../models/Subscriptions.js";

// Subscription resolvers
export const subscriptionResolvers = {
    Query: {
        _empty: () => "Empty query",
    },
    Mutation: {
        // Update subscription details
        updateSubscription: async (_, { id, planName, price, startDate, endDate, status }, { businessId }) => {
            // Check if the subscription exists and belongs to the business
            const subscription = await Subscription.findOne({ _id: id, businessId });
            if (!subscription) {
                throw new Error("Subscription not found or unauthorized");
            }

            // Ensure the provided planId exists and belongs to the business
            const plan = await Plan.findOne({ _id: planId, businessId });
            if (!plan) {
                throw new Error("Plan not found or unauthorized");
            }

            // Update subscription with the new details
            const updatedSubscription = await Subscription.findByIdAndUpdate(
                id,
                { planId, price, startDate, endDate, status },
                { new: true }
            );
            return updatedSubscription;
        },

        // Delete a subscription
        deleteSubscription: async (_, { id }, { businessId }) => {
            const subscription = await Subscription.findOne({ _id: id, businessId });
            if (!subscription) {
                throw new Error("Subscription not found or unauthorized");
            }

            await Subscription.findByIdAndDelete(id);
            return "Subscription deleted successfully";
        }
    }
};
