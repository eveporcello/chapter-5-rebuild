const { ApolloServer, gql } = require('apollo-server')
const { MongoClient } = require('mongodb')
const fs = require('fs')

require('dotenv').config()

const typeDefs = gql`
  ${fs.readFileSync('./typeDefs.graphql', 'UTF-8')}
`
const resolvers = require('./resolvers')

async function start() {
  const MONGO_DB = process.env.DB_HOST
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
