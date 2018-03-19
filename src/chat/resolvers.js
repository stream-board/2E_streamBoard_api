import { generalRequest, getRequest } from '../utilities';
import { url, port, entryPoint } from './server';

const URL = `http://${url}:${port}/${entryPoint}`;

const resolvers = {
    Query: {
        chatMsgByRoomId: (_, { id }) =>
            generalRequest(`${URL}/${id}/`, 'GET'),
    },
    Mutation: {
        createChatRoom: (_, { chatRoom }) =>
            generalRequest(`${URL}/`, 'POST', chatRoom),
        deleteChatRoom: (_, { id }) =>
            generalRequest(`${URL}/${id}/`, 'DELETE')
    }
};

export default resolvers;
