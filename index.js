const { ApolloServer, gql } = require('apollo-server')

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

server
  .listen()
  .then(({ port }) =>
    console.log(`GraphQL Server Running on http://localhost:${port}`)
  )
