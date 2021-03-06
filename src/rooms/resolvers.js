import { generalRequest, getRequest } from '../utilities';
import { url, port, entryPoint } from './server';
import { PubSub, withFilter } from 'graphql-subscriptions';
import * as users from '../sessions/server';
import * as chat from '../chat/server';
import * as board from '../board/server';

const URL = `http://${url}:${port}/${entryPoint}`;
const usersURL = `http://${users.url}:${users.port}/${users.entryPoint1}`;
const chatURL = `http://${chat.url}:${chat.port}/${chat.entryPoint}`;
const boardURL = `http://${board.url}:${board.port}/${board.entryPoint}`;
const pubsub = new PubSub();

var io = require('socket.io-client');
const socket = io.connect('http://35.231.29.114:5555', {reconnect: true});

console.log(socket)

socket.on('event', function(event){
	pubsub.publish(event.type, event.load);
})

const resolvers = {
	Query: {
		allRooms: (_, {}, context) =>{
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
							roomArray[i] = room
						}
						resolve(roomArray)
					})
				})
			})
		},
		roomById: (_, { id }) => {
			return new Promise((resolve, reject) => {
				generalRequest(`${URL}/${id}`, 'GET').then((response) => {
					let promiseArray = []
					let participants = response.Participants
					participants.forEach((participant) => {
						let promise =  generalRequest(`${usersURL}/${participant.idParticipant}/`, 'GET')
						promiseArray.push(promise)
					})
					Promise.all(promiseArray).then((values) => {
						response.Participants = []
						values.forEach((user) => {
							response.Participants.push(user.data)
						})
						generalRequest(`${usersURL}/${response.idOwner}/`, 'GET').then((owner) => {
							response.owner = owner.data
							resolve(response)
						})
					})
				})
			})
		},
		participantsById: (_, { id }) => {
			return new Promise((resolve, reject) => {
				generalRequest(`${URL}/${id}`, 'GET').then((response) => {
					let promiseArray = []
					let participants = response.Participants
					participants.forEach((participant) => {
						let promise =  generalRequest(`${usersURL}/${participant.idParticipant}/`, 'GET')
						promiseArray.push(promise)
					})
					Promise.all(promiseArray).then((values) => {
						let result = []
						values.forEach((user) => {
							result.push(user.data)
						})
						generalRequest(`${usersURL}/${response.idOwner}/`, 'GET').then((owner) => {
							result.push(owner.data)
							resolve(result)
						})
					})
				})
			})
		}
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
				return generalRequest(`${boardURL}/room`, 'POST', boardRoom).then(
          (boardData) =>{
            return generalRequest(`${chatURL}/`, 'POST', chatRoom).then(
              (chatData) =>{
                return generalRequest(`${usersURL}/${response.idOwner}/`, 'GET').then((owner) => {
									response.owner = owner.data
									pubsub.publish('roomAdded', {roomAdded: response});
									socket.emit('event', {
										type: 'roomAdded',
										load: {roomAdded: response}
									});
                  return response;
                })
            })
          })
			}),
		joinRoom: (_, { room }) =>
			generalRequest(`${URL}`, 'POST', room).then((response) => {
				return generalRequest(`${usersURL}/${room.idOwner}/`, 'GET').then((userData) => {
					pubsub.publish('participantJoined', {participantJoined: userData.data, roomId: room.idRoom});
					socket.emit('event', {
						type: 'participantJoined',
						load: {participantJoined: userData.data, roomId: room.idRoom}
					});
					return response
				})
			}),
		deleteRoom: (_, { roomDelete }) =>
			generalRequest(`${URL}/${roomDelete.idRoom}`, 'DELETE', roomDelete).then(
        (response) => {
          return generalRequest(`${chatURL}/${response.idRoom}/`, 'DELETE').then(
            (chatData) => {
							pubsub.publish('roomDeleted', { roomDeleted: response });
							socket.emit('event', {
								type: 'roomDeleted',
								load: { roomDeleted: response }
							});
              return response;
            }
          )
        }
			),
		exitRoom: (_, { roomDelete }) =>
			generalRequest(`${URL}/${roomDelete.idRoom}`, 'DELETE', roomDelete).then((response) => {
				pubsub.publish('participantLeft', {participantLeft: roomDelete.idOwner, roomId: roomDelete.idRoom});
				socket.emit('event', {
					type: 'participantLeft',
					load: {participantLeft: roomDelete.idOwner, roomId: roomDelete.idRoom}
				});
				return response
			}),
		banParticipant: (_, {bannedParticipant}) =>
			generalRequest(`${URL}/${bannedParticipant.idRoom}/ban`, 'POST', bannedParticipant).then((response) => {
				pubsub.publish('participantLeft', {participantLeft: bannedParticipant.idParticipant, roomId: bannedParticipant.idRoom});
				socket.emit('event', {
					type: 'participantLeft',
					load: {participantLeft: bannedParticipant.idParticipant, roomId: bannedParticipant.idRoom}
				});
				return generalRequest(`${URL}/${bannedParticipant.idRoom}`, 'DELETE', {idRoom: bannedParticipant.idRoom, idOwner: bannedParticipant.idParticipant}).then((response) => {
					return bannedParticipant.idParticipant
				})
			})
	},
	Subscription: {
		roomAdded: {
			subscribe: () => pubsub.asyncIterator('roomAdded')
		},
		participantJoined: {
			subscribe: withFilter(
        () => pubsub.asyncIterator('participantJoined'),
        (payload, variables) => payload.roomId === variables.roomId,
			)
		},
		participantLeft: {
			subscribe: withFilter(
        () => pubsub.asyncIterator('participantLeft'),
        (payload, variables) => payload.roomId === variables.roomId,
			)
		},
		roomDeleted: {
			subscribe: () => pubsub.asyncIterator('roomDeleted')
		}
	}
};

export default resolvers;
