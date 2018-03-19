import { generalRequest, getRequest } from '../utilities';
import { url, port, entryPoint } from './server';

const URL = `http://${url}:${port}/${entryPoint}`;

const resolvers = {
	Mutation: {
		createSession: (_, { session }) =>
			generalRequest(`${URL}/sign_in`, 'POST', session),
/*		deleteSession: (_, { id, session }) =>
			generalRequest(`${URL}/sing_out`, 'DELETE', session)*/
	}
};

export default resolvers;
