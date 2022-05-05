const express = require('express');
const routes = new express.Router();
const {getRepoList, getRepoDetails} = require('../controllers/repositoryController.js');


routes.get('/repositories/', getRepoList);
routes.get('/repodetails/', getRepoDetails);

module.exports = routes;