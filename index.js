const express = require('express')
const { ApolloServer } = require('apollo-server-express')
const { MongoClient } = require('mongodb')
const { readFileSync } = require('fs')
var resolvers = require('./resolvers')

require('dotenv').config()
var typeDefs = readFileSync('./typeDefs.graphql', 'UTF-8')

async function start() {
  const app = express()
  const MONGO_DB = process.env.DB_HOST
  const client = await MongoClient.connect(MONGO_DB, { useNewUrlParser: true })
  const db = client.db()

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      const token = req.headers.authorization || ''
      const githubToken = token.replace('bearer ', '')
      const currentUser = await db.collection('users').findOne({ githubToken })
      return { db, currentUser }
    }
  })

  server.applyMiddleware({ app })

  app.get('/', (req, res) => {
    let url = `https://github.com/login/oauth/authorize?client_id=${process.env.CLIENT_ID}&scope=user`
    res.end(`<a href="${url}">Sign In with Github</a>`)
  })

  app.listen({ port: 4000 }, () =>
    console.log(`GraphQL Server running at http://localhost:4000${server.graphqlPath}`)
  )
}

start()
