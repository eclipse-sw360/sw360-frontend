# SW360 Frontend project contributing guide

This is your first stop to contribute to SW360 Frontend project. From here you will find an overview of our contribution workflow.

Please read our code [Code of Conduct](./CODE_OF_CONDUCT.md) before to help with the well being of the community.

## New contributor guide

To get an overview of the project, read the [README](./README.md).

This project uses [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification to commit messages and [Apache Skywalking](https://github.com/apache/skywalking-eyes) for check the license headers.

### Setting up

It is recommended for easy development start usage of VSCode and Docker. A developer container setup is included and the entire setup is done after the devcontainer build.

If you intend to do in a local environment by yourself, the base requirements are pretty baseic, NodeJS LTS version and an editor of your choice. Then run:
```bash
> npm install
```

### Running test environment

We are assuming that you have some connection to an SW360 instance to test, so add the following `.env` configuration on the root of your repository clone:

```ini
# sw360-frontend/.env
NEXT_PUBLIC_SW360_API_URL = ${SW360_API_URL}   (e.g 'http://localhost:8080')
NEXTAUTH_SECRET = _any string_ (next auth secret key)
NEXTAUTH_URL = 'http://localhost:3000'
```

Then run:

```bash
> npm run dev
```

If everything went well, the localhost port 3000 will be opened in your host and you will able to access the app at the following address:

```bash
http://localhost:3000
```

### Source license headers and copyrights

Every file need to have the conformant license headers. To do that:

* Add this on the header of your source

```typescript
// Copyright (C) SW360 Frontend Authors (see <https://github.com/eclipse-sw360/sw360-frontend/blob/main/NOTICE>)

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE
```

* Add your copyright on thr NOTICE  file

If you want to check your code before push to CI is possible with docker. Just execute this command from the root of the projects:

```bash
> docker run -it --rm -v $(pwd):/github/workspace ghcr.io/apache/skywalking-eyes/ license-eye header check
```

### Commits

All commits are expected to be signed. [Here's Github documentation about signing commits](https://docs.github.com/en/authentication/managing-commit-signature-verification/signing-commits).

Commit header should follow convetional commits format, with type(info): message

Example:

```fix(project): Broken something and fixed```

Types allowed for this project commit:

* **build** - For buildsystem related commits
* **chore** - For small commit tasks
* **ci** - For CI related commits
* **docs** - For documentation related tasks
* **feat** - For new features commits
* **fix** - For code fix commits
* **perf** - Performance related commits
* **refactor** - For refactoring related commits
* **revert** - For revert commits
* **style** - For layout and styling commits
* **test** - For test related commits

Any other header will be caught on CI, and build will fail.

## Project Rules

* You shall never try to commit package managers lock file.
* You shall never try to commit image files except as SVG.
* You shall use NPM. Yarn and pnpm are as good, but we need deal with one only. You can use on your dev environment, but the default reference for testing is npm.
* You shall NEVER remove the copytright lines from NOTICE unless you are the owner
