import { generalRequest, getRequest } from '../utilities';
import { url, port, entryPoint, entryPoint1 } from './server';

const URL = `http://${url}:${port}/${entryPoint}`;
const URL1 = `http://${url}:${port}/${entryPoint1}`;

const resolvers = {
    Query: {
        userById: (_, { id }) =>
            generalRequest(`${URL1}/${id}/`, 'GET'),
    },
	Mutation: {
		createSession: (_, { session }) =>
			generalRequest(`${URL}/sign_in`, 'POST', session),
/*		deleteSession: (_, { id, session }) =>
			generalRequest(`${URL}/sing_out`, 'DELETE', session)*/
	}
};

export default resolvers;
