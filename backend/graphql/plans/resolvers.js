import Plan from "../../models/Plans.js";

export const planResolvers = {
    Query: {
        _empty: () => "Empty query",
    },
    Mutation: {
        updatePlan: async (_, { id, name, description, price, duration }) => {
            const plan = await Plan.findOne({ _id: id });

            if (!plan) {
                throw new Error("Plan not found or unauthorized");
            }

            const updatedPlan = await Plan.findByIdAndUpdate(
                id,
                { name, description, price, duration },
                { new: true }
            );

            return updatedPlan;
        },

        deletePlan: async (_, { id }) => {
            const plan = await Plan.findOne({ _id: id });

            if (!plan) {
                throw new Error("Plan not found or unauthorized");
            }

            await Plan.findByIdAndDelete(id);

            return "Plan deleted successfully";
        },
    },
};
