const express = require('express')
const { ApolloServer, gql } = require('apollo-server-express')
const { MongoClient } = require('mongodb')
const fs = require('fs')

require('dotenv').config()

const app = express()

var typeDefs = gql`
  ${fs.readFileSync('./typeDefs.graphql', 'UTF-8')}
`
var resolvers = require('./resolvers')

async function start() {
  const MONGO_DB = process.env.DB_HOST
  const client = await MongoClient.connect(
    MONGO_DB,
    { useNewUrlParser: true }
  )
  const db = client.db()

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      var token = req.headers.authorization || ''
      var githubToken = token.replace('bearer ', '')
      var user = await db.collection('users').findOne({ githubToken })
      return { db, user }
    }
  })

  server.applyMiddleware({ app })

  app.get('/', (req, res) => {
    let url = `https://github.com/login/oauth/authorize?client_id=${
      process.env.CLIENT_ID
    }&scope=user`
    res.end(`
        <a href="${url}">Sign In with Github</a>
    `)
  })

  app.listen({ port: 4000 }, () =>
    console.log(
      `GraphQL Server running at http://localhost:4000${server.graphqlPath}`
    )
  )
}

start()
