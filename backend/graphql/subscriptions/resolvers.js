import Plan from "../../models/Plans.js";
import Subscription from "../../models/Subscriptions.js";

// Subscription resolvers
export const subscriptionResolvers = {
    Query: {
        _empty: () => "Empty query",
    },
    Mutation: {
        // Update subscription details
        updateSubscription: async (_, { id, planId, price, startDate, endDate, status, paymentStatus }) => {
            try {
                const subscription = await Subscription.findById(id);
                if (!subscription) {
                    throw new Error("Subscription not found or unauthorized");
                }

                if (subscription.status === 'cancelled' && status !== 'cancelled') {
                    throw new Error("Cancelled subscriptions cannot be modified");
                }

                const updates = {};
                if (planId) updates.planId = planId;
                if (price !== undefined) updates.price = price;
                if (startDate) updates.startDate = startDate;
                if (endDate) updates.endDate = endDate;
                if (status) updates.status = status;
                if (paymentStatus) updates.paymentStatus = paymentStatus;

                const updatedSubscription = await Subscription.findByIdAndUpdate(id, updates, { new: true });
                if (!updatedSubscription) {
                    throw new Error("Failed to update subscription");
                }

                return updatedSubscription;
            } catch (error) {
                console.error("Error in updateSubscription:", error.message);
                throw new Error(error.message);
            }
        },
    }
};