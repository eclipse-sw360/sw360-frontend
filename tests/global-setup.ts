// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

/**
 * Global Setup
 *
 * This file runs ONCE before all tests start.
 * It creates test users in CouchDB for role-based access control testing.
 *
 * To enable role-based testing:
 * 1. Set ENABLE_ROLE_TESTS=true environment variable
 * 2. Ensure CouchDB is accessible (configured in tests/config.ts)
 */

import { createAllTestUsers, userExistsInCouchDb, testUsers } from './e2e/helpers/testUserSetup'

async function globalSetup(): Promise<void> {
    const enableRoleTests = process.env.ENABLE_ROLE_TESTS === 'true'

    if (!enableRoleTests) {
        console.log('ℹ Role-based tests disabled. Set ENABLE_ROLE_TESTS=true to enable.')
        return
    }

    console.log('\n🔧 Global Setup: Creating test users for role-based testing...')

    try {
        // Check if users already exist
        const userExists = await userExistsInCouchDb(testUsers.user.email)

        if (userExists) {
            console.log('⚠ Test users already exist, skipping creation')
            return
        }

        await createAllTestUsers()
        console.log('✓ Global setup complete\n')
    } catch (error) {
        console.error('✗ Global setup failed:', error)
        // Don't fail the entire test run if user creation fails
        // The individual auth setups will handle missing users gracefully
    }
}

export default globalSetup
