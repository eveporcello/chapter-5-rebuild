const express = require('express')
const { ApolloServer, gql } = require('apollo-server-express')

const app = express()

const typeDefs = gql`
  type Query {
    gnar: String
  }
`

const resolvers = {
  Query: {
    gnar() {
      return 'gnarly!!!'
    }
  }
}

const server = new ApolloServer({ typeDefs, resolvers })
server.applyMiddleware({ app })

app.get('/', (req, res) => res.end('Welcome to the PhotoShare API'))

app.listen({ port: 4000 }, () =>
  console.log(
    `GraphQL Server running at http://localhost:4000${server.graphqlPath}`
  )
)
