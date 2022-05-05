const { GraphQLClient } = require('graphql-request');

const graphQLClient = () => {
  const headers = { Authorization: `bearer ${process.env.GITHUB_TOKEN}` };
  return new GraphQLClient('https://api.github.com/graphql', { headers });
}

module.exports = {
  graphQLClient,
}