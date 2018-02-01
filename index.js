#!/usr/bin/env node
const program = require('commander');
const axios = require('axios');

const removeLastSlash = function(url){
    while (url.endsWith('/')){
        url = url.substring(0, url.length - 1);
    }
    return url;
};

program
    .option('-bhu, --bitbucket-http-url <bitbucketHttpUrl>', 'Bitbucket http url', removeLastSlash)
    .option('-bu, --bitbucket-username <bitbucketUsername>', 'Bitbucket username')
    .option('-bp, --bitbucket-password <bitbucketPassword>', 'Bitbucket password')
    .option('-gsu, --gerrit-ssh-url <gerritSshUrl>', 'Gerrit ssh url', removeLastSlash)
    .option('-gu, --gerrit-username <gerritUsername>', 'Gerrit username')
    .option('-gp, --gerrit-password <gerritPassword>', 'Gerrit password')
    .parse(process.argv);

const bitbucketReposUrl = `${program.bitbucketHttpUrl}/rest/api/1.0/repos`;
console.log(bitbucketReposUrl);

axios
    .get(bitbucketReposUrl)
    .then(response => {
        console.log(response.data);
    });