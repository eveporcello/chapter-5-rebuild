const { ApolloServer, gql } = require('apollo-server')
const { MongoClient } = require('mongodb')
const fs = require('fs')

var typeDefs = gql`
  ${fs.readFileSync('./typeDefs.graphql', 'UTF-8')}
`
var resolvers = require('./resolvers')

async function start() {
  const MONGO_DB = 'mongodb://localhost:27017/graphql-photos'
  const client = await MongoClient.connect(
    MONGO_DB,
    { useNewUrlParser: true }
  )
  const db = client.db()

  const context = { db }

  const server = new ApolloServer({ typeDefs, resolvers, context })

  server
    .listen()
    .then(({ port }) =>
      console.log(`GraphQL Server Running on http://localhost:${port}`)
    )
}

start()
