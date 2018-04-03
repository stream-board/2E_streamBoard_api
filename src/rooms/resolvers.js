import { generalRequest, getRequest } from '../utilities';
import { url, port, entryPoint } from './server';

const URL = `http://${url}:${port}/${entryPoint}`;

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
			generalRequest(`${URL}`, 'POST', room),	
		deleteRoom: (_, { roomDelete }) =>
			generalRequest(`${URL}/${roomDelete.idRoom}`, 'DELETE', roomDelete)
	}
};

export default resolvers;
