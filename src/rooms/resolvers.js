import { generalRequest, getRequest } from '../utilities';
import { url, port, entryPoint } from './server';
import * as users from '../sessions/server';
import * as chat from '../chat/server';
import * as board from '../board/server';

const URL = `http://${url}:${port}/${entryPoint}`;
const usersURL = `http://${users.url}:${users.port}/${users.entryPoint1}`;
const chatURL = `http://${chat.url}:${chat.port}/${chat.entryPoint}`;
const boardURL = `http://${board.url}:${board.port}/${board.entryPoint}`;

const resolvers = {
	Query: {
		allRooms: (_) =>
			generalRequest(`${URL}/`, 'GET'),
		roomById: (_, { id }) =>
			generalRequest(`${URL}/${id}`, 'GET'),
	},
	Mutation: {
		createRoom: (_, { room }) =>
			generalRequest(`${URL}`, 'POST', room).then((response) => {
				let boardRoom = {
					id: response.idRoom,
					admin: response.idOwner
				}
				let chatRoom = {
					id: response.idRoom
				}
				generalRequest(`${boardURL}/room`, 'POST', boardRoom).then((data) => data)
				generalRequest(`${chatURL}/`, 'POST', chatRoom)
				return response
			}),
		joinRoom: (_, { room }) =>
			generalRequest(`${URL}`, 'POST', room),
		deleteRoom: (_, { roomDelete }) =>
			generalRequest(`${URL}/${roomDelete.idRoom}`, 'DELETE', roomDelete)
	}
};

export default resolvers;

