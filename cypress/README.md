# SW360 automated E2E testing

## 1. Introduction
SW360 auto E2E testing is a system by using Cypress that is a next generation front end testing tool built for the modern web.

## 2. How to use

### 2.1. Requirement software

- Nodejs
    ```sh
    $ sudo apt-get update
    $ curl -sL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    $ sudo apt install nodejs -y
    // Check nodejs version
    $ nodejs -v
    ```
- NPM
    ```
    $ sudo apt-get install npm
    // Check npm version
    $ npm -v
    ```
- Google Chrome latest version

***Note***: Recommended environment is Ubuntu 22.04 LTS, Nodejs v20.5.0, NPM 10.2.5

### 2.2. Setup project

- Since the new front-end is still in development, this test code will work in the new front-end code with commit id: **f8d818333be404be5d9e56189fafe1d968788d29**
- Clone source code for testing
    ```sh
    $ git clone https://github.com/eclipse-sw360/sw360-frontend.git
    $ cd sw360-frontend
    ```
- Install dependencies
    ```sh
    $ sudo apt-get install libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev libnss3 libxss1 libasound2 libxtst6 xauth xvfb
    $ npm i
    $ sudo apt-get install jq
    ```
***Reference***: https://docs.cypress.io/guides/getting-started/installing-cypress#System-requirements

### 2.3. Run Testing

#### 2.3.1. Setup testing

- Change cypress configuration
    ```sh
    $ vim cypress.env.json
    ```

- Change these configs, keep others:
    - "sw360_base_url": ${sw360 frontend url}
    - "sw360_api_server": ${sw360 rest api url}
    - "couchdb_ip": ${couchdb url}
    - "couchdb_port": ${couchdb port}
    - "couchdb_username" ${couchdb username}
    - "couchdb_password" ${couchdb password}

#### 2.3.2. Prerequisite:

- There is an user in sw360 liferay with:
    - username: admin@sw360.org
    - password: 12345

#### 2.3.3. Run with Cypress UI

- Open Cypress 
    ```sh
    $ npm test
    ```
- Select a specify test file: <**file name**>.cy.js

#### 2.3.4. Run in headless mode

- Run all tests:
    ```sh
    $ npx cypress run --browser chrome
    ```

- Run a specify test:
    ```sh
    $ npx cypress run --browser chrome --spec <file.cy.js> <file1.cy.js> <file2.cy.js> ...
    ```

## 3. Limitation

- Currently, the SW360 rest APIs use Liferay users to authenticate. However, there is no Liferay API to support creating users in Liferay. So to run this test code, we need to create a user manually to log into the system:
    - username: admin@sw360.org
    - password: 12345