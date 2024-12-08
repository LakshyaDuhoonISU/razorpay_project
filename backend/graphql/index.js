import { mergeTypeDefs } from '@graphql-tools/merge';
import { mergeResolvers } from '@graphql-tools/merge';

// Import all typeDefs and resolvers
import { planTypeDefs } from './plans/typeDefs.js';
import { planResolvers } from './plans/resolvers.js';
import { customerTypeDefs } from './customers/typeDefs.js';
import { customerResolvers } from './customers/resolvers.js';
import { businessTypeDefs } from './businesses/typeDefs.js';
import { businessResolvers } from './businesses/resolvers.js';
import { subscriptionTypeDefs } from './subscriptions/typeDefs.js';
import { subscriptionResolvers } from './subscriptions/resolvers.js';

// Combine typeDefs and resolvers
export const typeDefs = mergeTypeDefs([planTypeDefs, customerTypeDefs, businessTypeDefs, subscriptionTypeDefs]);
export const resolvers = mergeResolvers([planResolvers, customerResolvers, businessResolvers, subscriptionResolvers]);