const express = require('express')
const { ApolloServer, gql } = require('apollo-server-express')
const { MongoClient } = require('mongodb')
const fs = require('fs')

const app = express()

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

  server.applyMiddleware({ app })

  app.get('/', (req, res) => res.end('Welcome to the PhotoShare API'))

  app.listen({ port: 4000 }, () =>
    console.log(
      `GraphQL Server running at http://localhost:4000${server.graphqlPath}`
    )
  )
}

start()
