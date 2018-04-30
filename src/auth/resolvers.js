import { generalRequest, getRequest } from '../utilities';
import { url, port, entryPoint } from './server';
import * as sessions from './../sessions/server';

const URL = `http://${url}:${port}/${entryPoint}`;
const sessionsURL = `http://${sessions.url}:${sessions.port}/${sessions.entryPoint}`;

const resolvers = {
    Mutation: {
        createSession: (_, { session }) =>{
            return new Promise((resolve, reject)=>{
                generalRequest(`${URL}`, 'POST', session).then((response)=>{
                    console.log(response);
                    if(response.answer) {
                        generalRequest(`${sessionsURL}/sign_in`, 'POST', session, true).then((sessionResponse) => {
                            let user = sessionResponse.body.data
                            user['token'] = sessionResponse.headers['access-token']
                            user['type'] = sessionResponse.headers['token-type']
                            user['client'] = sessionResponse.headers['client']
                            resolve(user);
                        })
                    } else {
                        reject(response.answer);
                    }
                })
            })
        }
    }
};

export default resolvers;