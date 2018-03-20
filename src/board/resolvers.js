import { generalRequest, getRequest } from '../utilities';
import { url, port, entryPoint } from './server';

const URL = `http://${url}:${port}/${entryPoint}`;

const resolvers = {
    Mutation: {
        createBoardRoom: (_, { room }) => {
            return generalRequest(`${URL}/room/`, 'POST', room).then((data) => data)
        }
    }
};

export default resolvers;
