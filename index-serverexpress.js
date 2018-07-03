const express = require('express')
const { ApolloServer, gql } = require('apollo-server-express')

const app = express()

var _id = 0
var photos = []

const typeDefs = gql`
  type Photo {
    id: ID!
    name: String!
    url: String!
    description: String
  }

  type Query {
    totalPhotos: Int!
    allPhotos: [Photo!]!
  }
  type Mutation {
    postPhoto(name: String!, description: String): Photo!
  }
`

const resolvers = {
  Query: {
    totalPhotos: () => photos.length,
    allPhotos: () => photos
  },
  Mutation: {
    postPhoto: (parent, args) => {
      var newPhoto = {
        id: _id++,
        ...args
      }
      photos.push(args)
      return newPhoto
    }
  },
  Photo: {
    url: parent => `http://yoursite.com/img/${parent.id}.jpg`
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
