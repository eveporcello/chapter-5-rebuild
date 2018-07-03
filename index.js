const { ApolloServer, gql } = require('apollo-server')

const typeDefs = gql`
  type Query {
    gnar: String
  }
`

const resolvers = {
  Query: {
    gnar: () => {
      return 'gnarly!!!'
    }
  }
}

const server = new ApolloServer({ typeDefs, resolvers })

server
  .listen()
  .then(({ port }) =>
    console.log(`GraphQL Server Running on http://localhost:${port}`)
  )
