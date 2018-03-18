import { generalRequest, getRequest } from '../utilities';
import { url, port, entryPoint } from './server';

const URL = `http://${url}:${port}/${entryPoint}`;

const resolvers = {
	Mutation: {
		createAuthentication: (_, { user }) =>
			generalRequest(`${URL}/sing_in`, 'POST', user),
/*		deleteAuthentication: (_, { id, user }) =>
			generalRequest(`${URL}/sing_out`, 'DELETE', user)*/
	}
};

export default resolvers;
