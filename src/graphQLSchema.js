import merge from 'lodash.merge';
import GraphQLJSON from 'graphql-type-json';
import { makeExecutableSchema } from 'graphql-tools';

import { mergeSchemas } from './utilities';

import {
	sessionsMutations,
	sessionsTypeDef
} from './sessions/typeDefs';

import {
	coursesMutations,
	coursesQueries,
	coursesTypeDef
} from './courses/typeDefs';

import{
	roomsMutations,
	roomsQueries,
	roomsTypeDef
} from './rooms/typeDefs';

import {
    chatMutations,
    chatQueries,
    chatTypeDef
} from './chat/typeDefs';

import sessionsResolvers from './sessions/resolvers';
import coursesResolvers from './courses/resolvers';
import roomsResolvers from './rooms/resolvers';
import chatResolvers from './chat/resolvers';

// merge the typeDefs
const mergedTypeDefs = mergeSchemas(
	[
		'scalar JSON',
		coursesTypeDef,
		sessionsTypeDef,
		roomsTypeDef,
        chatTypeDef
	],
	[
		coursesQueries,
		roomsQueries,
        chatQueries
	],
	[
		coursesMutations,
		sessionsMutations,
		roomsMutations,
        chatMutations
	]
);

// Generate the schema object from your types definition.
export default makeExecutableSchema({
	typeDefs: mergedTypeDefs,
	resolvers: merge(
		{ JSON: GraphQLJSON }, // allows scalar JSON
		roomsResolvers,
		sessionsResolvers,
		coursesResolvers,
        chatResolvers
	)
});
