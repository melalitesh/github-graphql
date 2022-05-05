const {getRepositories, getRepositoryDetails} = require('../services/repositoryService.js');

const validateUsernameParams = (username) => {
      if (!username || !username.trim()) {
        return res
          .status(400)
          .json({ status: 'ERROR', message: 'invalid_parameters' });
      }
}

const validateParams = ({username, repoName}) => {
  if (!username || !username.trim() || !repoName || !repoName.trim()) {
    return res
      .status(400)
      .json({ status: 'ERROR', message: 'invalid_parameters' });
  }
}
//get list of user repositories
 //first searching in cache and if not available then calling github graphQL api
const getRepoList = async (req, res) => {
  try {
    const {username} = req.query;
    validateUsernameParams(username);
    const data = await getRepositories(username);
    return res
      .status(200)
      .send({ status: true, data: data });

  } catch (err) {
    console.error(err);
    return res
      .status(201)
      .json({ status: false, message: err.toString() | 'exception-occurred' });
  }
}

//get details of a repository
//first searching in cache and if not available then calling github graphQL api
const getRepoDetails = async (req, res) => {
  try {
    const {username, repoName} = req.query;
    validateParams({username, repoName});
    const data = await getRepositoryDetails(username, repoName);
    return res
      .status(200)
      .json({ status: true, data: data });

  } catch (err) {
    console.error(err);
    return res
      .status(201)
      .json({ status: false, message: err.toString() | 'exception-occurred' });
  }
}

module.exports = {
  getRepoList,
  getRepoDetails
}