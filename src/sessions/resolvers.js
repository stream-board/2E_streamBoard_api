import { generalRequest, getRequest } from '../utilities';
import { url, port, entryPoint, entryPoint1 } from './server';

const URL = `http://${url}:${port}/${entryPoint}`;
const URL1 = `http://${url}:${port}/${entryPoint1}`;

const resolvers = {
    Query: {
        userById: (_, { id }) =>
			generalRequest(`${URL1}/${id}/`, 'GET'),
		validateSession: (_, { headersSession }) => {
			let headers = {
			'access-token' : headersSession.token,
			'client' : headersSession.client,
			'uid' : headersSession.uid
			}
			console.log( headersSession )
			console.log( headers )
			generalRequest(`${URL}/validate_token`, 'GET', {}, headers).then((response) => {
				console.log(response)
				let user = response.body.data
				user['token'] = response.headers['access-token']
				user['type'] = response.headers['token-type']
				user['client'] = response.headers['client']
				console.log( user )
				return user
			})}
    },
	Mutation: {
		createSession: (_, { session }) =>
			generalRequest(`${URL}/sign_in`, 'POST', session, true).then((response) => {
				let user = response.body.data
				user['token'] = response.headers['access-token']
				user['type'] = response.headers['token-type']
				user['client'] = response.headers['client']
				return user
			}),
		deleteSession: (_, { headersSession }) => {
			let headers = {
			'access-token' : headersSession.token,
			'client' : headersSession.client,
			'uid' : headersSession.uid
			}
			generalRequest(`${URL}/sign_out`, 'DELETE', {}, headers)
		}
	}
};

export default resolvers;
