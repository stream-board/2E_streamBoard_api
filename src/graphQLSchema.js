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

import sessionsResolvers from './sessions/resolvers';
import coursesResolvers from './courses/resolvers';
import roomsResolvers from './rooms/resolvers';

// merge the typeDefs
const mergedTypeDefs = mergeSchemas(
	[
		'scalar JSON',
		coursesTypeDef,
		sessionsTypeDef,
		roomsTypeDef
	],
	[
		coursesQueries,
		roomsQueries
	],
	[
		coursesMutations,
		sessionsMutations,
		roomsMutations
	]
);

// Generate the schema object from your types definition.
export default makeExecutableSchema({
	typeDefs: mergedTypeDefs,
	resolvers: merge(
		{ JSON: GraphQLJSON }, // allows scalar JSON
		roomsResolvers,
		sessionsResolvers,
		coursesResolvers
	)
});
