// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import fs from 'fs'
import { exec } from 'child_process'

const users = [
    {
        "email": "user001@sw360.org",
        "givename": "user001",
        "lastname": "test",
        "usergroup": "USER",
    },
    {
        "email": "admin002@sw360.org",
        "givename": "admin002",
        "lastname": "test",
        "usergroup": "ADMIN",
    },
    {
        "email": "clearingex001@sw360.org",
        "givename": "clearingex001",
        "lastname": "test",
        "usergroup": "CLEARING_EXPERT",
    }
]

const runShellCommand = (command: string) => {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout) => {
            if (error) {
                reject(error);
            } else {
                resolve(stdout);
            }
        });
    });
}

const clearUserByEmail = () => {
    return Object.values(users).map((user) => runShellCommand(`bash cypress/support/common.sh deleteUserByEmail ${user.email}`))
}

const cleanDB = () => {
    console.log("[Info] Clean up database")
    const bashs = [
        runShellCommand('bash cypress/support/common.sh deleteOauthClient'),
        runShellCommand('bash cypress/support/common.sh deleteAllReleases'),
        runShellCommand('bash cypress/support/common.sh deleteAllComponents'),
        runShellCommand('bash cypress/support/common.sh deleteAllProjects'),
        runShellCommand('bash cypress/support/common.sh deleteAllLicenses'),
        runShellCommand('bash cypress/support/common.sh deleteAllVendors'),
        ...clearUserByEmail()
    ]
    return Promise.all(bashs)
}

const initData = () => {
    console.log("[Info] Init data")
    const vendorNames = ['ven001', 'ven002', 'ven003']
    const licenseNames = ['AAL-1.01', 'Abstyles-2024', 'AFL-4.5']

    const bashs = [
        runShellCommand('bash cypress/support/common.sh createOauthClient')
    ]

    for (const vendorName of vendorNames) {
        bashs.push(runShellCommand(`bash cypress/support/common.sh createVendor ${vendorName}`))
    }

    for (const licenseName of licenseNames) {
        bashs.push(runShellCommand(`bash cypress/support/common.sh createLicense ${licenseName}`))
    }

    for (const user of users) {
        bashs.push(runShellCommand(`bash cypress/support/common.sh createUser ${user.email} ${user.givename} ${user.lastname} ${user.usergroup}`))
    }

    return Promise.all(bashs)
}

module.exports = (on: any, config: any) => {
    on('task', {
        removeDownloadedFiles() {
            const downloadPath = 'cypress/downloads'
            return new Promise((resolve, reject) => {
                fs.readdir(downloadPath, (err, files) => {
                    if (err) {
                        reject(err);
                    } else {
                        files.forEach((file) => {
                            const filePath = `${downloadPath}/${file}`;
                            fs.unlinkSync(filePath);
                        });
                        resolve(true);
                    }
                });
            })
        },
        async generateApiToken() {
            const clientData = JSON.parse(fs.readFileSync('cypress/fixtures/oauth-client.json', 'utf-8'))

            const myHeaders = new Headers()
            myHeaders.append("Authorization", `Basic ${Buffer.from(clientData.client_id + ':' + clientData.client_secret).toString('base64')}`)

            const requestOptions = {
                method: 'GET',
                headers: myHeaders,
            }

            const users = JSON.parse(fs.readFileSync('cypress/fixtures/sw360_users.json', 'utf-8'))
            const adminUser = users['admin']
            const response = await fetch(`${config.env.sw360_api_server}/authorization/oauth/token?grant_type=password&username=${adminUser.email}&password=${adminUser.password}`, requestOptions)
            const data = await response.json()
            return data.access_token;
        },
    }),
        on('before:run', async () => {
            await cleanDB()
            await initData()
        })
};