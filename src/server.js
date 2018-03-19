if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const Hapi = require('hapi')
const { graphqlHapi, graphiqlHapi } = require('apollo-server-hapi')
const DataLoader = require('dataloader')

async function start() {
  const server = new Hapi.Server({
    port: process.env.PORT,
    // compression: { minBytes: 1 }
  })

  await server.register({
    plugin: graphqlHapi,
    options: {
      path: '/graphql',
      graphqlOptions: (request) => ({
        schema: require('./schema'),
        context: {
          loaders: require('./loaders')
        }
      }),
      route: {
        cors: true
      }
    }
  })

  await server.register({
    plugin: graphiqlHapi,
    options: {
      path: '/graphiql',
      graphiqlOptions: (request) => ({
        schema: require('./schema'),
        context: {
          loaders: require('./loaders')
        },
        endpointURL: request.path.replace('graphiql', 'graphql')
      }),
      route: {
        cors: true
      }
    }
  })

  server.route(require('./routes'))

  await server.start()
}

start()
