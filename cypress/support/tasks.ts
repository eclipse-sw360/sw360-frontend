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
    },
    {
        "email": "admin@sw360.org",
        "givename": "Test",
        "lastname": "Admin",
        "usergroup": "ADMIN",
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
        runShellCommand('bash cypress/support/common.sh deleteAllLicenseTypes'),
        runShellCommand('bash cypress/support/common.sh deleteAllVendors'),
        ...clearUserByEmail(),
        runShellCommand('bash cypress/support/common.sh deleteAllObligations')
    ]
    return Promise.all(bashs)
}

const initData = () => {
    console.log("[Info] Init data")
    const vendorNames = ['ven001', 'ven002', 'ven003']
    const licenseNames = ['AAL-1.01', 'Abstyles-2024', 'AFL-4.5']

    const bashs = []
    const licenseTypes = ['LicenseType01', 'LicenseType02', 'LicenseType03']

    const obligations = [
        {
            'title': '"obligation 001"',
            'text': '"This is obligation text 001"',
            'obligationLevel': 4
        },
        {
            'title': '"obligation 002"',
            'text': '"This is obligation text 002"',
            'obligationLevel': 4
        },
        {
            'title': '"obligation 003"',
            'text': '"This is obligation text 003"',
            'obligationLevel': 4
        },
        {
            'title': '"obligation 004"',
            'text': '"This is obligation text 004"',
            'obligationLevel': 4
        }
    ]


    for (const vendorName of vendorNames) {
        bashs.push(runShellCommand(`bash cypress/support/common.sh createVendor ${vendorName}`))
    }

    for (const licenseName of licenseNames) {
        bashs.push(runShellCommand(`bash cypress/support/common.sh createLicense ${licenseName}`))
    }

    for (const licenseType of licenseTypes) {
        bashs.push(runShellCommand(`bash cypress/support/common.sh createLicenseType ${licenseType}`))
    }

    for (const user of users) {
        bashs.push(runShellCommand(`bash cypress/support/common.sh createUser ${user.email} ${user.givename} ${user.lastname} ${user.usergroup}`))
    }

    for (const obligation of obligations) {
        bashs.push(runShellCommand(`bash cypress/support/common.sh createObligation ${obligation.title} ${obligation.text} ${obligation.obligationLevel}`))
    }

    return Promise.all(bashs)
}

module.exports = (on: any, config: any) => {
    on('task', {
        removeDownloadsFolder() {
            const folderName = 'cypress/downloads'
            const { rmdir } = require('fs')
            console.log('deleting folder %s', folderName);
            return new Promise((resolve, reject) => {
                rmdir(folderName, { maxRetries: 10, recursive: true }, (err: any) => {
                    if (err) {
                        console.error(err);
                        return reject(err);
                    }
                    resolve(null);
                });
            });
        },
        async generateApiToken() {
            const users = JSON.parse(fs.readFileSync('cypress/fixtures/sw360_users.json', 'utf-8'))
            const adminUser = users['admin']
            const credentials = Buffer.from(`${adminUser.email}:${adminUser.password}`).toString('base64')
            const sw360token = `Basic ${credentials}`
            return sw360token
        },
    }),
        on('before:run', async () => {
            await cleanDB()
            await initData()
        })
};