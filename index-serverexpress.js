const express = require('express')
const { ApolloServer, gql } = require('apollo-server-express')

const app = express()

var photos = []

const typeDefs = gql`
  type Query {
    totalPhotos: Int!
  }
  type Mutation {
    postPhoto(name: String!, description: String): Boolean!
  }
`

const resolvers = {
  Query: {
    totalPhotos: () => photos.length
  },
  Mutation: {
    postPhoto: (parent, args) => {
      photos.push(args)
      return true
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
