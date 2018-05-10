import Koa from 'koa';
import KoaRouter from 'koa-router';
import koaLogger from 'koa-logger';
import koaCors from '@koa/cors';

import { graphiqlKoa, graphqlKoa } from 'apollo-server-koa';
import graphQLSchema from './graphQLSchema';
import { execute, subscribe } from 'graphql';

import { formatErr, validateToken } from './utilities';

import { SubscriptionServer } from 'subscriptions-transport-ws';
import { createServer } from 'http';

var bodyParser = require('koa-bodyparser');

const app = new Koa();
const router = new KoaRouter();
const PORT = process.env.PORT || 5000;
const SUBSCRIPTIONS_PATH = '/subscriptions';

//app.use(koaLogger());
app.use(koaCors());

app.use(bodyParser());

// read token from header
app.use(async (ctx, next) => {
  let operation = ctx.request.body.operationName;
  console.log(operation)
  if(operation == 'CreateSessionMutation' || operation == 'ValidateTokenQuery'){
    console.log('LOGIN');
    await next();
  } else {
    if (ctx.header['access-token']) {
      console.log(ctx.header);
      const token = ctx.header['access-token'];
      const uid = ctx.header['uid'];
      const client = ctx.header['client'];
      let isValid = validateToken(token, uid, client);
      if(isValid){
        await next();
      } else {
        ctx.throw(401, 'Not authorized');
      }
    } else {
      ctx.throw(401, 'Not authorized');
    }
  }
});

// GraphQL
const graphql = graphqlKoa((ctx) => ({
	schema: graphQLSchema,
	context: { token: ctx.state.token },
	formatError: formatErr
}));
router.post('/graphql', bodyParser(), graphql);
router.get('/graphql', graphql);

// test route
//HELp
router.get('/graphiql', graphiqlKoa({ endpointURL: '/graphql', subscriptionsEndpoint: `ws://35.190.138.158/subscriptions` }));

app.use(router.routes());
app.use(router.allowedMethods());

const server = createServer(app.callback())

server.listen(PORT, () => {
  console.log(`API Server is now running on http://localhost:${PORT}/graphql`)
  console.log(`API Subscriptions server is now running on ws://localhost:${PORT}${SUBSCRIPTIONS_PATH}`)
});

// Subs
SubscriptionServer.create(
  {
    schema: graphQLSchema,
    execute,
    subscribe,
  },
  {
    server,
    path: SUBSCRIPTIONS_PATH,
  }
);

console.log(SubscriptionServer)