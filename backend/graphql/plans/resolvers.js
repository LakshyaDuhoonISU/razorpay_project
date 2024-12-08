import Plan from "../../models/Plans.js";

export const planResolvers = {
    Mutation: {
        updatePlan: async (_, { id, name, description, price, duration }) => {
            const updatedPlan = await Plan.findByIdAndUpdate(
                id,
                { name, description, price, duration },
                { new: true }
            );

            if (!updatedPlan) {
                throw new Error("Plan not found");
            }

            return updatedPlan;
        },

        deletePlan: async (_, { id }) => {
            const deletedPlan = await Plan.findByIdAndDelete(id);

            if (!deletedPlan) {
                throw new Error("Plan not found");
            }

            return "Plan deleted successfully";
        },
    },
};
