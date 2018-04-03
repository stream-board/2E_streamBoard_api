import { generalRequest, getRequest } from '../utilities';
import { url, port, entryPoint } from './server';
import * as users from '../sessions/server';

const URL = `http://${url}:${port}/${entryPoint}`;
const usersURL = `http://${users.url}:${users.port}/${users.entryPoint1}`

const resolvers = {
	Query: {
		allRooms: (_) =>
			generalRequest(`${URL}/`, 'GET'),
		roomById: (_, { id }) =>
			generalRequest(`${URL}/${id}`, 'GET'),
	},
	Mutation: {
		createRoom: (_, { room }) =>
			generalRequest(`${URL}`, 'POST', room),
		joinRoom: (_, { room }) =>
			generalRequest(`${URL}`, 'POST', room).then((response) => {
				console.log(response)
				return response
			}),	
		deleteRoom: (_, { roomDelete }) =>
			generalRequest(`${URL}/${roomDelete.idRoom}`, 'DELETE', roomDelete)
	}
};

export default resolvers;
