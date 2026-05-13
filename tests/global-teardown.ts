// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

/**
 * Global Teardown
 *
 * This file runs ONCE after all tests complete.
 * It cleans up test users from CouchDB.
 *
 * Cleanup runs when ENABLE_ROLE_TESTS=true
 */

import { deleteAllTestUsers, userExistsInCouchDb, testUsers } from './e2e/helpers/testUserSetup'

async function globalTeardown(): Promise<void> {
    const enableRoleTests = process.env.ENABLE_ROLE_TESTS === 'true'

    if (!enableRoleTests) {
        return
    }

    console.log('\n🧹 Global Teardown: Cleaning up test users...')

    try {
        // Check if users exist before trying to delete
        const userExists = await userExistsInCouchDb(testUsers.user.email)

        if (!userExists) {
            console.log('⚠ Test users not found, skipping cleanup')
            return
        }

        await deleteAllTestUsers()
        console.log('✓ Global teardown complete\n')
    } catch (error) {
        console.error('✗ Global teardown failed:', error)
        // Don't fail if cleanup fails - tests already completed
    }
}

export default globalTeardown
