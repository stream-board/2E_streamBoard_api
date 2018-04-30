import Koa from 'koa';
import KoaRouter from 'koa-router';
import koaLogger from 'koa-logger';
import koaBody from 'koa-bodyparser';
import koaCors from '@koa/cors';

import { graphiqlKoa, graphqlKoa } from 'apollo-server-koa';
import graphQLSchema from './graphQLSchema';
import { execute, subscribe } from 'graphql';

import { formatErr } from './utilities';

import { SubscriptionServer } from 'subscriptions-transport-ws';
import { createServer } from 'http';

const app = new Koa();
const router = new KoaRouter();
const PORT = process.env.PORT || 5000;
const SUBSCRIPTIONS_PATH = '/subscriptions';

//app.use(koaLogger());
app.use(koaCors());

// read token from header
app.use(async (ctx, next) => {
	if (ctx.header.authorization) {
		const token = ctx.header.authorization.match(/Bearer ([A-Za-z0-9]+)/);
		if (token && token[1]) {
			ctx.state.token = token[1];
		}
	}
	await next();
});

// GraphQL
const graphql = graphqlKoa((ctx) => ({
	schema: graphQLSchema,
	context: { token: ctx.state.token },
	formatError: formatErr
}));
router.post('/graphql', koaBody(), graphql);
router.get('/graphql', graphql);

// test route
router.get('/graphiql', graphiqlKoa({ endpointURL: '/graphql', subscriptionsEndpoint: `ws://ec2-35-168-17-78.compute-1.amazonaws.com:5000/subscriptions` }));

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
