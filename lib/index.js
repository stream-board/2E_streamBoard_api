'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Koa = _interopDefault(require('koa'));
var KoaRouter = _interopDefault(require('koa-router'));
var koaLogger = _interopDefault(require('koa-logger'));
var koaBody = _interopDefault(require('koa-bodyparser'));
var koaCors = _interopDefault(require('@koa/cors'));
var apolloServerKoa = require('apollo-server-koa');
var merge = _interopDefault(require('lodash.merge'));
var GraphQLJSON = _interopDefault(require('graphql-type-json'));
var graphqlTools = require('graphql-tools');
var request = _interopDefault(require('request-promise-native'));
var graphql = require('graphql');

/**
 * Creates a request following the given parameters
 * @param {string} url
 * @param {string} method
 * @param {object} [body]
 * @param {boolean} [fullResponse]
 * @param {object} [headers]
 * @return {Promise.<*>} - promise with the error or the response object
 */
async function generalRequest(url, method, body, fullResponse, headers) {
	const parameters = {
		method,
		uri: encodeURI(url),
		headers: headers,
		body,
		json: true,
		resolveWithFullResponse: fullResponse
	};
	if (process.env.SHOW_URLS) {
		// eslint-disable-next-line
		console.log(url);
	}

	try {
		return await request(parameters);
	} catch (err) {
		return err;
	}
}

/**
 * Adds parameters to a given route
 * @param {string} url
 * @param {object} parameters
 * @return {string} - url with the added parameters
 */


/**
 * Generates a GET request with a list of query params
 * @param {string} url
 * @param {string} path
 * @param {object} parameters - key values to add to the url path
 * @return {Promise.<*>}
 */


/**
 * Merge the schemas in order to avoid conflicts
 * @param {Array<string>} typeDefs
 * @param {Array<string>} queries
 * @param {Array<string>} mutations
 * @return {string}
 */
function mergeSchemas(typeDefs, queries, mutations) {
	return `${typeDefs.join('\n')}
    type Query { ${queries.join('\n')} }
    type Mutation { ${mutations.join('\n')} }`;
}

function formatErr(error) {
	const data = graphql.formatError(error);
	const { originalError } = error;
	if (originalError && originalError.error) {
		const { path } = data;
		const { error: { id: message, code, description } } = originalError;
		return { message, code, description, path };
	}
	return data;
}

const sessionsTypeDef = `
type User{
    id: Int!
    email: String!
    provider: String!
    name: String!
    nickname: String!
    image: String
}

type LoginData{
    id: Int!
    email: String!
    name: String!
    nickname: String!
    image: String
    token: String!
    type: String!
    client: String!
}

type Data{
    data: User! 
}

type Success{
    success: String! 
}

input SessionInput {
    email: String!
    password: String!
}

input Headers {
    uid: String!
    token: String!
    client: String!
}
`;

const sessionsQueries = `
    userById(id: Int!): Data!
    validateSession(headersSession: Headers!): LoginData!
`;

const sessionsMutations = `
    createSession(session: SessionInput!): LoginData!
    deleteSession(headersSession: Headers!): Success!
`;

const roomsTypeDef = `

type Room {
    idRoom: Int!
    nameRoom: String!
    descriptionRoom: String
    owner: User
    Participants: [User]
}

type Participant {
    id: Int!
    idRoom: Int!
    idParticipant: Int!
}

input CreateRoomInput {
    nameRoom: String
    descriptionRoom: String
    idOwner: Int!
}

input JoinRoomInput {
    idRoom: Int!
    idOwner: Int!
}

input RoomDelete {
  idRoom: Int!,
  idOwner: Int!
}
`;

const roomsQueries = `
    allRooms: [Room]!
    roomById(id: Int!): Room!
`;

const roomsMutations = `
    createRoom(room: CreateRoomInput!): Room!
    joinRoom(room: JoinRoomInput!): Room!
    deleteRoom(roomDelete: RoomDelete!): Room!
`;

const boardTypeDef = `
    input BoardRoomInput {
        id: Int!
        admin: String!
    }
    type BoardRoom {
        id: Int!
    }
`;

const boardMutations = `
    createBoardRoom(room: BoardRoomInput!): BoardRoom!
`;

const chatTypeDef = `
type ChatRoom {
    id: Int!
}

type ChatMessage {
    message: String!,
    sender: String!,
}

input ChatRoomInput {
    id: Int!
}
`;

const chatQueries = `
    chatMsgByRoomId(id: Int!): [ChatMessage]!
`;

const chatMutations = `
    createChatRoom(chatRoom: ChatRoomInput!): ChatRoom!,
    deleteChatRoom(id: Int!): ChatRoom!
`;

const url = process.env.AUTHENTICATION_URL || 'ec2-18-232-78-10.compute-1.amazonaws.com';
const port = process.env.AUTHENTICATION_PORT || '4003';
const entryPoint = process.env.AUTHENTICATION_ENTRY || 'auth';
const entryPoint1 = process.env.AUTHENTICATION_ENTRY1 || 'users';

const URL = `http://${url}:${port}/${entryPoint}`;
const URL1 = `http://${url}:${port}/${entryPoint1}`;

const resolvers = {
    Query: {
        userById: (_, { id }) =>
			generalRequest(`${URL1}/${id}/`, 'GET'),
		validateSession: (_, { headersSession }) => {
			return new Promise((resolve, reject) => {
				generalRequest(`${URL}/validate_token`, 'GET', {}, true, {
					client : headersSession.client,
					uid : headersSession.uid,
					access_token: headersSession.token
				}).then((response) => {
					let user = response.body.data;
					user['token'] = response.headers['access-token'];
					user['type'] = response.headers['token-type'];
					user['client'] = response.headers['client'];
					delete user['provider'];
					delete user['uid'];
					delete user['allow_password_change'];
					resolve(user);
				}).catch((error) => {
					reject(error);
				});
			})
		}
    },
	Mutation: {
		createSession: (_, { session }) =>
			generalRequest(`${URL}/sign_in`, 'POST', session, true).then((response) => {
				let user = response.body.data;
				user['token'] = response.headers['access-token'];
				user['type'] = response.headers['token-type'];
				user['client'] = response.headers['client'];
				return user
			}),
		deleteSession: (_, { headersSession }) => {
			return new Promise((resolve, reject) => {
				generalRequest(`${URL}/sign_out`, 'DELETE', {}, true, {
					client : headersSession.client,
					uid : headersSession.uid,
					access_token: headersSession.token
				}).then((response) => {
					resolve(response.body);
				}).catch((error) => {
					reject(error);
				});
			})
		}
	}
};

const url$1 = process.env.ROOMS_URL || 'ec2-18-232-78-10.compute-1.amazonaws.com';
const port$1 = process.env.ROOMS_PORT || '4001';
const entryPoint$1 = process.env.ROOMS_ENTRY || 'rooms';

const url$2 = process.env.CHAT_URL || 'ec2-54-224-164-98.compute-1.amazonaws.com';
const port$2 = process.env.CHAT_PORT || '4002';
const entryPoint$2 = process.env.CHAT_ENTRY || 'chat-room';

const url$3 = process.env.BOARD_URL || 'ec2-34-228-226-216.compute-1.amazonaws.com';
const port$3 = process.env.BOARD_PORT || '4002';
const entryPoint$3 = process.env.BOARD_ENTRY || 'api';

const URL$1 = `http://${url$1}:${port$1}/${entryPoint$1}`;
const usersURL = `http://${url}:${port}/${entryPoint1}`;
const chatURL = `http://${url$2}:${port$2}/${entryPoint$2}`;
const boardURL = `http://${url$3}:${port$3}/${entryPoint$3}`;

const resolvers$1 = {
	Query: {
		allRooms: (_) =>{
			return new Promise((resolve, reject) => {
				generalRequest(`${URL$1}/`, 'GET').then((response) => {
					let promiseArray = [];
					let roomArray = [];
					response.forEach((room) => {
						let promise =  generalRequest(`${usersURL}/${room.idOwner}/`, 'GET');
						promiseArray.push(promise);
						roomArray.push(room);
					});
					Promise.all(promiseArray).then((values) => {
						for(let i=0; i<roomArray.length; i++){
							let room = roomArray[i];
							let userData = values[i];
							delete room['idOwner'];
							room['owner'] = userData.data;
							roomArray[i] = room;
						}
						resolve(roomArray);
					});
				});
			})
		},
		roomById: (_, { id }) => {
			return new Promise((resolve, reject) => {
				generalRequest(`${URL$1}/${id}`, 'GET').then((response) => {
					let promiseArray = [];
					let participants = response.Participants;
					participants.forEach((participant) => {
						let promise =  generalRequest(`${usersURL}/${participant.idParticipant}/`, 'GET');
						promiseArray.push(promise);
					});
					Promise.all(promiseArray).then((values) => {
						response.Participants = [];
						values.forEach((user) => {
							response.Participants.push(user.data);
						});
						generalRequest(`${usersURL}/${response.idOwner}/`, 'GET').then((owner) => {
							response.owner = owner.data;
							resolve(response);
						});
					});
				});
			})
		}
	},
	Mutation: {
		createRoom: (_, { room }) =>
			generalRequest(`${URL$1}`, 'POST', room).then((response) => {
				let boardRoom = {
					id: response.idRoom,
					admin: response.idOwner
				};
				let chatRoom = {
					id: response.idRoom
				};
				return generalRequest(`${boardURL}/room`, 'POST', boardRoom).then(
          (boardData) =>{
            return generalRequest(`${chatURL}/`, 'POST', chatRoom).then(
              (chatData) =>{
                return response;
            })
          })
			}),
		joinRoom: (_, { room }) =>
			generalRequest(`${URL$1}`, 'POST', room),
		deleteRoom: (_, { roomDelete }) =>
			generalRequest(`${URL$1}/${roomDelete.idRoom}`, 'DELETE', roomDelete).then(
        (response) => {
          return generalRequest(`${chatURL}/${response.idRoom}/`, 'DELETE').then(
            (chatData) => {
              return response;
            }
          )
        }
      )
	}
};



/*
allRooms: (_) =>{
			return new Promise((resolve, reject) => {
				generalRequest(`${URL}/`, 'GET').then((response) => {
					let promiseArray = []
					let roomArray = []
					response.forEach((room) => {
						let promise =  generalRequest(`${usersURL}/${room.idOwner}/`, 'GET')
						promiseArray.push(promise)
						roomArray.push(room)
					})
					Promise.all(promiseArray).then((values) => {
						for(let i=0; i<roomArray.length; i++){
							let room = roomArray[i]
							let userData = values[i]
							delete room['idOwner']
							room['owner'] = userData.data
							return room
						}
						console.log(values)
						return values
					})
				})
			})
		}*/

const URL$2 = `http://${url$3}:${port$3}/${entryPoint$3}`;

const resolvers$2 = {
    Mutation: {
        createBoardRoom: (_, { room }) => {
            return generalRequest(`${URL$2}/room`, 'POST', room).then((data) => data)
        }
    }
};

const URL$3 = `http://${url$2}:${port$2}/${entryPoint$2}`;

const resolvers$3 = {
    Query: {
        chatMsgByRoomId: (_, { id }) =>
            generalRequest(`${URL$3}/${id}/`, 'GET'),
    },
    Mutation: {
        createChatRoom: (_, { chatRoom }) =>
            generalRequest(`${URL$3}/`, 'POST', chatRoom),
        deleteChatRoom: (_, { id }) =>
            generalRequest(`${URL$3}/${id}/`, 'DELETE')
    }
};

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
var graphQLSchema = graphqlTools.makeExecutableSchema({
	typeDefs: mergedTypeDefs,
	resolvers: merge(
		{ JSON: GraphQLJSON }, // allows scalar JSON
		resolvers$1,
		resolvers,
		resolvers$2,
    	resolvers$3
	)
});

const app = new Koa();
const router = new KoaRouter();
const PORT = process.env.PORT || 5000;

app.use(koaLogger());
app.use(koaCors());

// read token from header
app.use(async (ctx, next) => {
	if (ctx.header.authorization) {
		const token = ctx.header.authorization.match(/Bearer ([A-Za-z0-9]+)/);
		if (token && token[1]) {
			ctx.state.token = token[1];
		}
	}
	await next();
});

// GraphQL
const graphql$1 = apolloServerKoa.graphqlKoa((ctx) => ({
	schema: graphQLSchema,
	context: { token: ctx.state.token },
	formatError: formatErr
}));
router.post('/graphql', koaBody(), graphql$1);
router.get('/graphql', graphql$1);

// test route
router.get('/graphiql', apolloServerKoa.graphiqlKoa({ endpointURL: '/graphql' }));

app.use(router.routes());
app.use(router.allowedMethods());
// eslint-disable-next-line
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
