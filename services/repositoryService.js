const { gql } = require('graphql-request');
const { graphQLClient } = require('../common/gql');
const { Octokit } = require("@octokit/rest");


/**
 * 
 * @param {*} repoOwnerName name of repository owner
 * @param {*} maxRepos no of max repos to fetch
 * @returns Repository name size and owner object
 */
const getRepositories = async (repoOwnerName, maxRepos = 50) => {
  const variables = {};
    const query = gql`{
      repositoryOwner(login: "${repoOwnerName}") {
        repositories(first: ${maxRepos}) {
          nodes {
            name
            diskUsage
            owner {          
              login
            }
          }
        }
      }
    }`;
    const data = await graphQLClient().request(query, variables);
    const { nodes } = data.repositoryOwner.repositories;
    let response = [];
    nodes.map((node) => {
      const { name, diskUsage } = node;
      const { login } = node.owner;
      response.push({
        "Repository Name": name,
        "Repository Size":diskUsage,
        "Repository Owner":login
      });
    });
    return response;
}
/**
 * 
 * @param {*} repoOwnerName name of repository owner
 * @param {*} repoName name of repository
 * @returns Repository Object with details
 */
const getRepositoryDetails = async (repoOwnerName, repoName) => { 

  try {
    const variables = {};
    const query = gql`{
      repository(owner: "${repoOwnerName}", name: "${repoName}") {
          name
          diskUsage
          isPrivate
          owner {
            login
          }   
          object(expression: "HEAD:") {
            ... on Tree {
              entries {
                name
                type
                object {
                  ... on Blob {
                    byteSize                  
                  }
                  ... on Tree {
                    entries {
                      name
                      type
                      object {
                        ... on Blob {
                          byteSize                        
                        }
                      }
                    }
                  }
                }
              }
            }
          }        
        }  
      }
    `;
    const data = await graphQLClient().request(query, variables);
    let response = [];

    const { name, diskUsage, isPrivate } = data.repository;
    const { login } = data.repository.owner;    
    let entries = JSON.parse(JSON.stringify(data.repository.object)); 
    const  {folderCount,fileCount} = await getNoOfFiles(entries);   
    const activeWebhooks = await getActiveWebhooks(repoOwnerName, repoName);
    const {text,haveYmlFile} = await haveYmlFiles(entries,repoOwnerName,repoName);

    response.push({
      "Repo Name": name,
      "Repo Size":diskUsage,
      "Repo Owner":login,
      "Private Repo":isPrivate,
      "Root Level Files":fileCount,  
      "Root Level Folders":folderCount,
      "YAML File":haveYmlFile,
      "YAML content":text,
      "Active Webhooks":activeWebhooks     
    });
    return response;
  } catch (error) {
    return false;
  }  
}


/**
 * 
 * @param {*} filesArr Array of files available in repository
 * @param {*} repoOwnerName Name of repository owner
 * @param {*} repoName name of repository
 * @returns JSON object with text and boolean of yaml file present
 */
const haveYmlFiles = async (filesArr,repoOwnerName,repoName) => {    
 
  let text = '';
  for(var i=0;i<filesArr.entries.length;i++){ 
    let splitArr = filesArr.entries[i].name.split('.');
    if(splitArr[1]){        
      if(filesArr.entries[i].name.includes('yml')) {      
        //get yml file content
        let variables = {};
        let query = gql`{repository(owner: "${repoOwnerName}", name: "${repoName}") {
          content: object(expression: "HEAD:${splitArr[0]}.yml") {
            ... on Blob {
              text
            }
          }
        }}`;
        let data = await graphQLClient().request(query, variables);
        return {text:data.repository.content.text,haveYmlFile:true}; 
     }  
    }        
  }   
  return {text:text,haveYmlFile:false}; 
}

/**
 * 
 * @param {*} filesArr Array of filename
 * @returns 
 */
const getNoOfFiles = async (filesArr) => {
  let files = 0;
  let folders = 0;

  const listOf1stLevelFiles = filesArr.entries.filter(it => it.type === 'blob');
  const listofDirectories = filesArr.entries.filter(it => it.type === 'tree');

  files += listOf1stLevelFiles.length;
  folders += listofDirectories.length;   

  return {folderCount:folders, fileCount:files };
}

/**
 * 
 * @param {*} repoOwnerName Repository owner name
 * @param {*} repoName Repository name
 * @returns text or json object response
 */
const getActiveWebhooks = async (repoOwnerName, repoName ) => {
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });

    try{
      const response = await octokit.rest.repos.listWebhooks({
        owner: repoOwnerName,
        repo: repoName
      })

      if(response.data.length < 1){
        return 'No webhooks present';	
      } else {
        return res.data;
      }
    } catch(err) {
      return 'No webhooks present';
    }
}



module.exports = {
  getRepositories,
  getRepositoryDetails,
  haveYmlFiles,
  getNoOfFiles,
  getActiveWebhooks
};
