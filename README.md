## Bitbucket to Gerrit migration tool

Migrate your BitBucket git repositories to Gerrit in a blink.

## Prerequisites of the machine that will execute this tool

- [NodeJS](https://nodejs.org/en/) 8+
- [GIT](https://git-scm.com/), meaning `git --version` should work 

## Usage

```bash
npx bitbucket-to-gerrit --help
```

```bash
  Usage: bitbucket-to-gerrit [options]


  Options:

    -b, --bitbucket-url <url>                       Bitbucket url
    -u, --bitbucket-username <username>             Bitbucket username
    -p, --bitbucket-password <password>             Bitbucket password
    -e, --bitbucket-repositories-to-exclude [name]  Bitbucket repositories to exclude
    -i, --bitbucket-repositories-to-include [name]  Bitbucket repositories to include
    -g, --gerrit-url <url>                          Gerrit url
    -U, --gerrit-username <username>                Gerrit username
    -P, --gerrit-password <password>                Gerrit password
    -h, --help                                      output usage information
 ```
 
## Examples

#### Migrate all repositories

```bash
npx bitbucket-to-gerrit \
-b "https://bitbucket.doe.com" -u bitbucketuser -p bitbucketpassword \
-g "https://gerrit.doe.com" -U gerrituser -P gerritpassword
```

#### Migrate all repositories except some of them

Migrate all repositories except `first-repo-to-exclude` and `second-repo-to-exclude`:

```bash
npx bitbucket-to-gerrit \
-b "https://bitbucket.foo.com" -u bitbucketuser -p bitbucketpassword \
-g "https://gerrit.foo.com" -U gerrituser -P gerritpassword \
-e first-repo-to-exclude -e second-repo-to-exclude
```

#### Migrate only specific repositories

Migrate only repositories `first-repo-to-include` and `second-repo-to-include`:

```bash
npx bitbucket-to-gerrit \
-b "https://bitbucket.foo.com" -u bitbucketuser -p bitbucketpassword \
-g "https://gerrit.foo.com" -U gerrituser -P gerritpassword \
-i first-repo-to-include -i second-repo-to-include
```