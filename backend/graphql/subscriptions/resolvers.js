import Subscription from "../../models/Subscriptions.js";

// Subscription resolvers
export const subscriptionResolvers = {
    Mutation: {
        // Update subscription details
        updateSubscription: async (_, { id, planName, price, startDate, endDate, status }) => {
            const updatedSubscription = await Subscription.findByIdAndUpdate(
                id,
                { planName, price, startDate, endDate, status },
                { new: true }
            );
            if (!updatedSubscription) {
                throw new Error("Subscription not found");
            }
            return updatedSubscription;
        },

        // Delete a subscription
        deleteSubscription: async (_, { id }) => {
            const deletedSubscription = await Subscription.findByIdAndDelete(id);
            if (!deletedSubscription) {
                throw new Error("Subscription not found");
            }
            return "Subscription deleted successfully";
        }
    }
};
