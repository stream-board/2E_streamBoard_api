import merge from 'lodash.merge';
import GraphQLJSON from 'graphql-type-json';
import { makeExecutableSchema } from 'graphql-tools';

import { mergeSchemas } from './utilities';

import {
	sessionsMutations,
	sessionsQueries,
	sessionsTypeDef
} from './sessions/typeDefs';


import{
	roomsMutations,
	roomsQueries,
	roomsTypeDef
} from './rooms/typeDefs';

import {
	boardMutations,
	boardTypeDef
} from './board/typeDefs'

import {
  chatMutations,
  chatQueries,
  chatTypeDef
} from './chat/typeDefs';

import sessionsResolvers from './sessions/resolvers';
import roomsResolvers from './rooms/resolvers';
import boardResolvers from './board/resolvers';
import chatResolvers from './chat/resolvers';

// merge the typeDefs
const mergedTypeDefs = mergeSchemas(
	[
		'scalar JSON',
		sessionsTypeDef,
		roomsTypeDef,
		boardTypeDef,
    	chatTypeDef
	],
	[
		sessionsQueries,
		roomsQueries,
     	chatQueries
	],
	[
		sessionsMutations,
		roomsMutations,
		boardMutations,
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
		boardResolvers,
    	chatResolvers
	)
});
