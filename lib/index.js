'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Koa = _interopDefault(require('koa'));
var KoaRouter = _interopDefault(require('koa-router'));
var koaLogger = _interopDefault(require('koa-logger'));
var koaCors = _interopDefault(require('@koa/cors'));
var apolloServerKoa = require('apollo-server-koa');
var merge = _interopDefault(require('lodash.merge'));
var GraphQLJSON = _interopDefault(require('graphql-type-json'));
var graphqlTools = require('graphql-tools');
var request = _interopDefault(require('request-promise-native'));
var graphql = require('graphql');
var graphqlSubscriptions = require('graphql-subscriptions');
var subscriptionsTransportWs = require('subscriptions-transport-ws');
var http = require('http');

const url = process.env.AUTHENTICATION_URL || 'authentication-ms';
const port = process.env.AUTHENTICATION_PORT || '4003';
const entryPoint = process.env.AUTHENTICATION_ENTRY || 'auth';
const entryPoint1 = process.env.AUTHENTICATION_ENTRY1 || 'users';

const validationURL = `http://${url}:${port}/${entryPoint}/validate_token`;


/**
 * Creates a request following the given parameters
 * @param {string} url
 * @param {string} method
 * @param {object} [body]
 * @param {boolean} [fullResponse]
 * @param {object} [headers]
 * @return {Promise.<*>} - promise with the error or the response object
 */
async function generalRequest(url$$1, method, body, fullResponse, headers) {
	const parameters = {
		method,
		uri: encodeURI(url$$1),
		headers: headers,
		body,
		json: true,
		resolveWithFullResponse: fullResponse
	};
	if (process.env.SHOW_URLS) {
		// eslint-disable-next-line
		console.log(url$$1);
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
function mergeSchemas(typeDefs, queries, mutations, subscriptions) {
	return `${typeDefs.join('\n')}
    type Query { ${queries.join('\n')} }
		type Mutation { ${mutations.join('\n')} }
		type Subscription { ${subscriptions.join('\n')} }`;
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

function validateToken(token, uid, client){
	return new Promise((resolve, reject) => {
		generalRequest(`${validationURL}`, 'GET', {}, false, {
			client : client,
			uid : uid,
			access_token: token
		}).then((response) => {
			console.log(response);
			resolve(true);
		}).catch((error) => {
			console.log(error);
			reject(error);
		});
	})
}

const sessionsTypeDef = `
type User {
    id: Int!
    email: String!
    provider: String!
    name: String!
    nickname: String!
    image: String
}

type LoginData {
    id: Int!
    email: String!
    name: String!
    nickname: String!
    image: String
    token: String!
    type: String!
    client: String!
}

type Data {
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
    deleteSession(headersSession: Headers!): Success!
`;

const roomsTypeDef = `

type Room {
    idRoom: Int!
    nameRoom: String!
    descriptionRoom: String
    categoryRoom: String!
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
    categoryRoom: String!
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

input BannedParticipant {
    idRoom: Int!,
    idParticipant: Int!
}

`;

const roomsQueries = `
    allRooms: [Room]!
    roomById(id: Int!): Room!
    participantsById(id: Int!): [User]
`;

const roomsMutations = `
    createRoom(room: CreateRoomInput!): Room!
    joinRoom(room: JoinRoomInput!): Room!
    deleteRoom(roomDelete: RoomDelete!): Room!
    exitRoom(roomDelete: RoomDelete): Room!
    banParticipant(bannedParticipant: BannedParticipant):  Int
`;

const roomsSubscriptions = `
    roomAdded: Room
    participantJoined(roomId: Int!): User
    participantLeft(roomId: Int!): Int
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
    id: Int!
    user_id: Int!,
    message: String!
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

const authTypeDef = `
    type Auth {
        email: String!
        password: String!
        answer: String!
    }

    input AuthInput {
        email: String!
        password: String!
    }
`;

const authMutations = `
    createSession(session: AuthInput!): LoginData!
`;

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

const url$1 = process.env.ROOMS_URL || 'rooms-ms';
const port$1 = process.env.ROOMS_PORT || '4001';
const entryPoint$1 = process.env.ROOMS_ENTRY || 'rooms';

const url$2 = process.env.CHAT_URL || 'chat-ms';
const port$2 = process.env.CHAT_PORT || '4002';
const entryPoint$2 = process.env.CHAT_ENTRY || 'chat-room';

const url$3 = process.env.BOARD_URL || 'board-ms';
const port$3 = process.env.BOARD_PORT || '4002';
const entryPoint$3 = process.env.BOARD_ENTRY || 'api';

const URL$1 = `http://${url$1}:${port$1}/${entryPoint$1}`;
const usersURL = `http://${url}:${port}/${entryPoint1}`;
const chatURL = `http://${url$2}:${port$2}/${entryPoint$2}`;
const boardURL = `http://${url$3}:${port$3}/${entryPoint$3}`;
const pubsub = new graphqlSubscriptions.PubSub();

const resolvers$1 = {
	Query: {
		allRooms: (_, {}, context) =>{
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
		},
		participantsById: (_, { id }) => {
			return new Promise((resolve, reject) => {
				generalRequest(`${URL$1}/${id}`, 'GET').then((response) => {
					let promiseArray = [];
					let participants = response.Participants;
					participants.forEach((participant) => {
						let promise =  generalRequest(`${usersURL}/${participant.idParticipant}/`, 'GET');
						promiseArray.push(promise);
					});
					Promise.all(promiseArray).then((values) => {
						let result = [];
						values.forEach((user) => {
							result.push(user.data);
						});
						generalRequest(`${usersURL}/${response.idOwner}/`, 'GET').then((owner) => {
							result.push(owner.data);
							resolve(result);
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
                return generalRequest(`${usersURL}/${response.idOwner}/`, 'GET').then((owner) => {
									response.owner = owner.data;
									pubsub.publish('roomAdded', {roomAdded: response});
                  return response;
                })
            })
          })
			}),
		joinRoom: (_, { room }) =>
			generalRequest(`${URL$1}`, 'POST', room).then((response) => {
				return generalRequest(`${usersURL}/${room.idOwner}/`, 'GET').then((userData) => {
					pubsub.publish('participantJoined', {participantJoined: userData.data, roomId: room.idRoom});
					return response
				})
			}),
		deleteRoom: (_, { roomDelete }) =>
			generalRequest(`${URL$1}/${roomDelete.idRoom}`, 'DELETE', roomDelete).then(
        (response) => {
          return generalRequest(`${chatURL}/${response.idRoom}/`, 'DELETE').then(
            (chatData) => {
              return response;
            }
          )
        }
			),
		exitRoom: (_, { roomDelete }) =>
			generalRequest(`${URL$1}/${roomDelete.idRoom}`, 'DELETE', roomDelete).then((response) => {
				pubsub.publish('participantLeft', {participantLeft: roomDelete.idOwner, roomId: roomDelete.idRoom});
				return response
			}),
		banParticipant: (_, {bannedParticipant}) =>
			generalRequest(`${URL$1}/${bannedParticipant.idRoom}/ban`, 'POST', bannedParticipant).then((response) => {
				pubsub.publish('participantLeft', {participantLeft: bannedParticipant.idParticipant, roomId: bannedParticipant.idRoom});
				return generalRequest(`${URL$1}/${bannedParticipant.idRoom}`, 'DELETE', {idRoom: bannedParticipant.idRoom, idOwner: bannedParticipant.idParticipant}).then((response) => {
					return bannedParticipant.idParticipant
				})
			})
	},
	Subscription: {
		roomAdded: {
			subscribe: () => pubsub.asyncIterator('roomAdded')
		},
		participantJoined: {
			subscribe: graphqlSubscriptions.withFilter(
        () => pubsub.asyncIterator('participantJoined'),
        (payload, variables) => payload.roomId === variables.roomId,
			)
		},
		participantLeft: {
			subscribe: graphqlSubscriptions.withFilter(
        () => pubsub.asyncIterator('participantLeft'),
        (payload, variables) => payload.roomId === variables.roomId,
			)
		}
	}
};

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

const url$4 = process.env.AUTH_URL || 'authentication-ms';
const port$4 = process.env.AUTH_PORT || '4003';
const entryPoint$4 = process.env.AUTH_ENTRY || 'ldap';

const URL$4 = `http://${url$4}:${port$4}/${entryPoint$4}`;
const sessionsURL = `http://${url}:${port}/${entryPoint}`;

const resolvers$4 = {
    Mutation: {
        createSession: (_, { session }) =>{
            return new Promise((resolve, reject)=>{
                generalRequest(`${URL$4}`, 'POST', session).then((response)=>{
                    console.log(response);
                    if(response.answer) {
                        generalRequest(`${sessionsURL}/sign_in`, 'POST', session, true).then((sessionResponse) => {
                            let user = sessionResponse.body.data;
                            user['token'] = sessionResponse.headers['access-token'];
                            user['type'] = sessionResponse.headers['token-type'];
                            user['client'] = sessionResponse.headers['client'];
                            resolve(user);
                        });
                    } else {
                        reject(response.answer);
                    }
                });
            })
        }
    }
};

// merge the typeDefs
const mergedTypeDefs = mergeSchemas(
	[
		'scalar JSON',
		sessionsTypeDef,
		roomsTypeDef,
		boardTypeDef,
		chatTypeDef,
		authTypeDef
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
		chatMutations,
		authMutations
	],
	[
		roomsSubscriptions
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
		resolvers$3,
		resolvers$4
	)
});

var bodyParser = require('koa-bodyparser');

const app = new Koa();
const router = new KoaRouter();
const PORT = process.env.PORT || 5000;
const SUBSCRIPTIONS_PATH = '/subscriptions';

//app.use(koaLogger());
app.use(koaCors());

app.use(bodyParser());

// read token from header
app.use((ctx, next) => {
  let operation = ctx.request.body.operationName;
  console.log(operation);
  if(operation == 'CreateSessionMutation' || operation == 'ValidateTokenQuery'){
    console.log('LOGIN');
    next();
  } else {
    if (ctx.header['access-token']) {
      console.log(ctx.header);
      const token = ctx.header['access-token'];
      const uid = ctx.header['uid'];
      const client = ctx.header['client'];
      validateToken(token, uid, client).then((response) => {
        next();
      }).catch((err) => {
        console.log(err);
        ctx.throw(401, 'Not authorized');
      });
    } else {
      ctx.throw(401, 'Not authorized');
    }
  }
});

// GraphQL
const graphql$1 = apolloServerKoa.graphqlKoa((ctx) => ({
	schema: graphQLSchema,
	context: { token: ctx.state.token },
	formatError: formatErr
}));
router.post('/graphql', bodyParser(), graphql$1);
router.get('/graphql', graphql$1);

// test route
//HELp
router.get('/graphiql', apolloServerKoa.graphiqlKoa({ endpointURL: '/graphql', subscriptionsEndpoint: `ws://35.190.138.158/subscriptions` }));

app.use(router.routes());
app.use(router.allowedMethods());

const server = http.createServer(app.callback());

server.listen(PORT, () => {
  console.log(`API Server is now running on http://localhost:${PORT}/graphql`);
  console.log(`API Subscriptions server is now running on ws://localhost:${PORT}${SUBSCRIPTIONS_PATH}`);
});

// Subs
subscriptionsTransportWs.SubscriptionServer.create(
  {
    schema: graphQLSchema,
    execute: graphql.execute,
    subscribe: graphql.subscribe,
  },
  {
    server,
    path: SUBSCRIPTIONS_PATH,
  }
);

console.log(subscriptionsTransportWs.SubscriptionServer);
