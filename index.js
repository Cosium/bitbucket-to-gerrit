#!/usr/bin/env node
const program = require('commander');
const axios = require('axios');
const childProcess = require('child_process');
const tempy = require('tempy');
const camelCase = require('camelcase');

const assertMandatoryArgumentsPresence = (program, names) => {
    names.forEach(name => {
        if (typeof program[camelCase(name)] !== 'undefined') {
            return;
        }
        console.error(`Missing argument '${name}'`);
        process.exit(1);
    });
};

const collect = (val, memo) => {
    memo.push(val);
    return memo;
};

const removeLastSlash = (url) => {
    while (url.endsWith('/')) {
        url = url.substring(0, url.length - 1);
    }
    return url;
};

program
    .option('-b, --bitbucket-url <url>', 'Bitbucket url', removeLastSlash)
    .option('-u, --bitbucket-username <username>', 'Bitbucket username')
    .option('-p, --bitbucket-password <password>', 'Bitbucket password')
    .option('-e, --bitbucket-repositories-to-exclude [name]', 'Bitbucket repositories to exclude', collect, [])
    .option('-i, --bitbucket-repositories-to-include [name]', 'Bitbucket repositories to include', collect, [])
    .option('-g, --gerrit-url <url>', 'Gerrit url', removeLastSlash)
    .option('-U, --gerrit-username <username>', 'Gerrit username')
    .option('-P, --gerrit-password <password>', 'Gerrit password')
    .parse(process.argv);

assertMandatoryArgumentsPresence(program, [
    'bitbucket-url',
    'bitbucket-username',
    'bitbucket-password',
    'gerrit-url',
    'gerrit-username',
    'gerrit-password'
]);

console.info(`BitBucket url is '${program.bitbucketUrl}'`);
console.info(`BitBucket user is '${program.bitbucketUsername}'`);
console.info(`Excluding bitbucket repositories named '${program.bitbucketRepositoriesToExclude}'`);
console.info(`Gerrit url is '${program.gerritUrl}'`);
console.info(`Gerrit user is '${program.gerritUsername}'\n`);

const gerritProjectsUrl = `${program.gerritUrl}/a/projects`;
const bitbucketReposUrl = `${program.bitbucketUrl}/rest/api/1.0/repos?limit=1000`;
console.info(`Fetching repositories from '${bitbucketReposUrl}'\n`);

const bitbucketCredentials = {username: program.bitbucketUsername, password: program.bitbucketPassword};
const gerritCredentials = {username: program.gerritUsername, password: program.gerritPassword};
const repositoriesToExclude = program.bitbucketRepositoriesToExclude;
const repositoriesToInclude = program.bitbucketRepositoriesToInclude;
const tempDirectory = tempy.directory();


const addCredentialsToUrl = (url, username, password) => {
    const insertionPoint = url.match(/^https?:\/\//)[0].length;
    return url.substring(0, insertionPoint) + username + ':' + password + '@' + url.substring(insertionPoint, url.length)
};

const cloneAndPush = (repository) => {
    const clonedRepoDirectory = `${tempDirectory}/${repository.name}.git`;

    const sourceRepoUrl = `${program.bitbucketUrl}/scm/${repository.project.key}/${repository.name}.git`;
    console.info(`Cloning '${sourceRepoUrl}' to '${clonedRepoDirectory}'`);
    const sourceRepoUrlWithCredentials = addCredentialsToUrl(sourceRepoUrl, program.bitbucketUsername, program.bitbucketPassword);
    childProcess.execSync(`git clone --mirror ${sourceRepoUrlWithCredentials}`, {cwd: tempDirectory});

    const targetRepoUrl = `${program.gerritUrl}/${repository.name}.git`;
    const targetRepoUrlWithCredentials = addCredentialsToUrl(targetRepoUrl, program.gerritUsername, program.gerritPassword);

    console.info(`Change origin of '${clonedRepoDirectory}'`);
    childProcess.execSync(`git remote set-url origin ${targetRepoUrlWithCredentials}`, {cwd: clonedRepoDirectory});

    childProcess.execSync(`git remote update`, {cwd: clonedRepoDirectory});
    console.info(`Pushing '${clonedRepoDirectory}' to '${targetRepoUrl}'`);
    childProcess.execSync(`git show-ref | cut -d' ' -f2 | grep -v 'refs/heads\\|refs/tags\\|refs/meta/config' | xargs -r -L1 git update-ref -d`, {cwd: clonedRepoDirectory});
    childProcess.execSync(`git push --mirror`, {cwd: clonedRepoDirectory});
};

const processRepository = (repository) => {
    if (repositoriesToExclude.indexOf(repository.name) !== -1) {
        console.info(`Ignoring repository ${repository.name}`);
        return Promise.resolve();
    }
    if (repositoriesToInclude.length > 0
        && repositoriesToInclude.indexOf(repository.name) === -1) {
        return Promise.resolve();
    }

    const name = repository.name;
    console.info(`Processing repository '${name}'`);

    return axios
        .get(`${gerritProjectsUrl}/${name}`, {auth: gerritCredentials})
        .then(() => console.info(`Gerrit project '${name}' already exists`),
            error => {
                if (error.response.status === 404) {
                    console.info(`Creating project '${name}'`);
                    return axios.put(
                        `${gerritProjectsUrl}/${name}`,
                        {},
                        {auth: gerritCredentials}
                    )
                        .then(response => response.data);
                } else {
                    return Promise.reject(error);
                }
            })
        .then(() => cloneAndPush(repository));
};

const repositoryFailures = [];

axios.get(bitbucketReposUrl, {auth: bitbucketCredentials})
    .then(response => response.data)
    .then(data => data.values)
    .then(repositories => {
        console.info(`Found ${repositories.length} bitbucket repositories`);
        let processChain = Promise.resolve();
        repositories.forEach(repository => processChain = processChain
            .then(() =>
                processRepository(repository)
                    .catch((error) => {
                        console.error(error);
                        repositoryFailures.push({
                            name: repository.name,
                            error: error
                        });
                    })
            ));
        return processChain;
    })
    .then(() => {
        if (repositoryFailures.length === 0) {
            console.info('All repositories were correctly migrated');
            return;
        }
        repositoryFailures.forEach(failure => console.error(`Migration failed for repository ${failure.name}`));
    });