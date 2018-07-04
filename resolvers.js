const { GraphQLScalarType } = require('graphql')
const { authorizeWithGithub } = require('./lib')
const fetch = require('node-fetch')

var users = require('./data/users.json')
var tags = require('./data/tags.json')

require('dotenv').config()

const resolvers = {
  Query: {
    me: (parent, args, ctx) => ctx.user,
    totalPhotos: (parent, args, ctx) =>
      ctx.db.collection('photos').countDocuments(),

    allPhotos: (parent, args, ctx) =>
      ctx.db
        .collection('photos')
        .find()
        .toArray(),

    totalUsers: (parent, args, { db }) =>
      db.collection('users').countDocuments(),

    allUsers: (parent, args, { db }) =>
      db
        .collection('users')
        .find()
        .toArray()
  },
  Mutation: {
    async postPhoto(root, args, { db, user }) {
      // 1. If there is not a user in context, throw an error
      if (!user) {
        throw new Error('only an authorized user can post a photo')
      }

      // 2. Save the current user's id with the photo
      const newPhoto = {
        ...args.input,
        userID: user.githubLogin,
        created: new Date()
      }

      // 3. Insert the new photo, capture the id that the database created
      const { insertedIds } = await db.collection('photos').insert(newPhoto)
      newPhoto.id = insertedIds[0]

      return newPhoto
    },
    async githubAuth(parent, { code }, { db, user }) {
      // 1. Obtain data from GitHub
      var {
        message,
        access_token,
        avatar_url,
        login,
        name
      } = await authorizeWithGithub({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        code
      })

      // 2. If there is a message, something went wrong
      if (message) {
        throw new Error(message)
      }

      // 3. Package the results in a single object
      var user = {
        name,
        githubLogin: login,
        githubToken: access_token,
        avatar: avatar_url
      }

      // 4. See if the account exists
      var hasAccount = await db
        .collection('users')
        .findOne({ githubLogin: login })

      if (hasAccount) {
        // 5. If so, update the record with the latest info
        await db
          .collection('users')
          .findOneAndUpdate({ githubLogin: login }, user)
      } else {
        // 6. If not, add the user
        await db.collection('users').insert(user)
      }

      // 7. Return user data and their token
      return { user, token: access_token }
    },
    addFakeUsers: async (root, { count }, { db }) => {
      var randomUserApi = `https://randomuser.me/api/?results=${count}`

      var { results } = await fetch(randomUserApi).then(res => res.json())

      var users = results.map(r => ({
        githubLogin: r.login.username,
        name: `${r.name.first} ${r.name.last}`,
        avatar: r.picture.thumbnail,
        githubToken: r.login.sha1
      }))

      await db.collection('users').insert(users)

      return users
    },
    async fakeUserAuth(parent, { githubLogin }, { db }) {
      var user = await db.collection('users').findOne({ githubLogin })

      if (!user) {
        throw new Error(`Cannot find user with githubLogin "${githubLogin}"`)
      }

      return {
        token: user.githubToken,
        user
      }
    }
  },
  Photo: {
    id: parent => parent.id || parent._id,
    url: parent => `/img/photos/${parent._id}.jpg`,
    postedBy: (parent, args, { db }) =>
      db.collection('users').findOne({ githubLogin: parent.userID }),
    taggedUsers: parent =>
      tags

        // Returns an array of tags that only contain the current photo
        .filter(tag => tag.photoID === parent.id)

        // Converts the array of tags into an array of userIDs
        .map(tag => tag.userID)

        // Converts array of userIDs into an array of user objects
        .map(userID => users.find(u => u.githubLogin === userID))
  },
  User: {
    postedPhotos: parent => {
      return photos.filter(p => p.githubUser === parent.githubLogin)
    },
    inPhotos: parent =>
      tags

        // Returns an array of tags that only contain the current user
        .filter(tag => tag.userID === parent.id)

        // Converts the array of tags into an array of photoIDs
        .map(tag => tag.photoID)

        // Converts array of photoIDs into an array of photo objects
        .map(photoID => photos.find(p => p.id === photoID))
  },
  DateTime: new GraphQLScalarType({
    name: 'DateTime',
    description: 'A valid date time value.',
    parseValue: value => new Date(value),
    serialize: value => new Date(value).toISOString(),
    parseLiteral: ast => ast.value
  })
}

module.exports = resolvers
