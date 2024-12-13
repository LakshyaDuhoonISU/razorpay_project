import Business from "../../models/Business.js";
import Customer from "../../models/Customers.js";
import Plan from "../../models/Plans.js";
import Transaction from "../../models/Transactions.js";
import Subscription from "../../models/Subscriptions.js";
import admin from '../../firebase.cjs'
import { session } from "../../neo4j.cjs";

export const businessResolvers = {
    Query: {
        _empty: () => "Empty query",
    },
    Mutation: {
        // Update business profile
        updateBusiness: async (_, { id, name, email, phone, address }) => {
            // if (id !== businessId) {
            //     throw new Error("Unauthorized: Cannot delete another business's profile");
            // }

            const business = await Business.findById(id);
            const firebaseUid = business.firebaseUid;

            try {
                await session.run(
                    `
                MATCH (b:Business {id: $firebaseUid})
                SET b.name = $name, b.phone = $phone, b.address = $address
                RETURN b
                `,
                    {
                        firebaseUid,
                        name,
                        phone,
                        address
                    }
                );
            } catch (neo4jerr) {
                console.error("Neo4j error: ", neo4jerr);
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
        deleteBusiness: async (_, { id }) => {
            // if (id !== businessId) {
            //     throw new Error("Unauthorized: Cannot delete another business's profile");
            // }

            // Find the business to delete
            const business = await Business.findById(id);

            if (!business) {
                throw new Error("Business not found");
            }

            // Delete business from Firebase
            try {
                await admin.auth().deleteUser(business.firebaseUid);  // Firebase deletion
            } catch (error) {
                console.error("Error deleting user from Firebase:", error);
                throw new Error("Failed to delete user from Firebase");
            }

            try {
                await session.run(
                    `
                    MATCH (b:Business {id: $firebaseUid})
                    OPTIONAL MATCH (c:Customer)-[r:TRANSACTED_WITH]->(b)
                    DELETE r
                    DETACH DELETE c
                    DELETE b
                    `,
                    { firebaseUid: business.firebaseUid }
                );
            } catch (neo4jerr) {
                console.error("Neo4j error: ", neo4jerr);
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