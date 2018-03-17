import { generalRequest, getRequest } from '../utilities';
import { url, port, entryPoint } from './server';

const URL = `http://${url}:${port}/${entryPoint}`;

const resolvers = {
	Query: {
		allCourses: (_) =>
			getRequest(URL, ''),
		courseById: (_, { id }) =>
			generalRequest(`${URL}/${id}`, 'GET'),
	},
	Mutation: {
		createCourse: (_, { course }) =>
			generalRequest(`${URL}`, 'POST', course),
		updateCourse: (_, { id, course }) =>
			generalRequest(`${URL}/${id}`, 'PUT', course),
		deleteCourse: (_, { id }) =>
			generalRequest(`${URL}/${id}`, 'DELETE')
	}
};

export default resolvers;
