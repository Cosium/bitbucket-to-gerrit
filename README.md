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
    -e, --bitbucket-repositories-to-exclude [name]  Bitbucket repositories to exclude (default: )
    -i, --bitbucket-repositories-to-include [name]  Bitbucket repositories to include (default: )
    -g, --gerrit-url <url>                          Gerrit url
    -U, --gerrit-username <username>                Gerrit username
    -P, --gerrit-password <password>                Gerrit password
    -h, --help                                      output usage information
 ```
 
## Example

```bash
npx bitbuket-to-gerrit \
-b "https://bitbucket.foo.com" -u john -p 1234 \
-g "https://gerrit.foo.com" -U jane -P 1234
```