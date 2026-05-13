// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { request } from '@playwright/test'
import { config } from '../../config'

/**
 * Test User Data Setup
 *
 * This module provides functions to create and delete test users directly via CouchDB.
 * Users are created with specific roles for access control testing.
 */

export interface TestUser {
    email: string
    password: string
    givenName: string
    lastName: string
    fullName: string
    department: string
    userGroup: string
    externalid: string
}

// BCrypt hash for password '12345'
const PASSWORD_HASH = '$2a$10$KcGk3lFG1JkS05sCt1TtaeLy11Xy8HNUkn7JvD2Nsqikhdqn8dLaq'

/** Test users to be created for role-based testing */
export const testUsers: Record<string, TestUser> = {
    user: {
        email: 'testuser@sw360.org',
        password: '12345',
        givenName: 'Test',
        lastName: 'User',
        fullName: 'Test User',
        department: 'DEPARTMENT',
        userGroup: 'USER',
        externalid: 'sw360testuser',
    },
    viewer: {
        email: 'testviewer@sw360.org',
        password: '12345',
        givenName: 'Test',
        lastName: 'Viewer',
        fullName: 'Test Viewer',
        department: 'DEPARTMENT',
        userGroup: 'USER', // SW360 may not have a separate VIEWER role
        externalid: 'sw360testviewer',
    },
    clearingAdmin: {
        email: 'testclearing@sw360.org',
        password: '12345',
        givenName: 'Test',
        lastName: 'Clearing',
        fullName: 'Test Clearing',
        department: 'DEPARTMENT',
        userGroup: 'CLEARING_ADMIN',
        externalid: 'sw360testclearing',
    },
}

/**
 * Get CouchDB connection URL with authentication
 */
function getCouchDbAuthUrl(): string {
    const { url, username, password } = config.couchdb
    // Insert auth into URL: http://admin:password@localhost:5984
    const urlObj = new URL(url)
    urlObj.username = username
    urlObj.password = password
    return urlObj.toString().replace(/\/$/, '')
}

/**
 * Create a user directly in CouchDB
 */
export async function createUserInCouchDb(user: TestUser): Promise<{ success: boolean; error?: string }> {
    // Check if user already exists
    const exists = await userExistsInCouchDb(user.email)
    if (exists) {
        console.log(`⚠ User already exists in CouchDB: ${user.email}`)
        return { success: true }
    }

    const apiContext = await request.newContext()
    const couchDbUrl = getCouchDbAuthUrl()
    const dbName = config.couchdb.usersDbName

    try {
        const userData = {
            type: 'user',
            email: user.email,
            userGroup: user.userGroup,
            externalid: user.externalid,
            fullname: user.fullName,
            givenname: user.givenName,
            lastname: user.lastName,
            department: user.department,
            wantsMailNotification: false,
            deactivated: false,
            issetBitfield: '1',
            password: PASSWORD_HASH,
        }

        const response = await apiContext.post(`${couchDbUrl}/${dbName}`, {
            headers: {
                'Content-Type': 'application/json',
            },
            data: userData,
        })

        if (response.status() === 201) {
            console.log(`✓ Created user in CouchDB: ${user.email} (${user.userGroup})`)
            await apiContext.dispose()
            return { success: true }
        } else if (response.status() === 409) {
            console.log(`⚠ User already exists in CouchDB: ${user.email}`)
            await apiContext.dispose()
            return { success: true }
        } else {
            const body = await response.text()
            console.error(`✗ Failed to create user ${user.email}: ${response.status()} - ${body}`)
            await apiContext.dispose()
            return { success: false, error: `${response.status()}: ${body}` }
        }
    } catch (error) {
        console.error(`✗ Error creating user ${user.email}:`, error)
        await apiContext.dispose()
        return { success: false, error: String(error) }
    }
}

/**
 * Delete a user from CouchDB by email
 */
export async function deleteUserFromCouchDb(email: string): Promise<{ success: boolean; error?: string }> {
    const apiContext = await request.newContext()
    const couchDbUrl = getCouchDbAuthUrl()
    const dbName = config.couchdb.usersDbName

    try {
        // First, find the user by email using CouchDB _find endpoint
        const findResponse = await apiContext.post(`${couchDbUrl}/${dbName}/_find`, {
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                selector: {
                    email: email,
                },
                fields: ['_id', '_rev'],
                limit: 10,
            },
        })

        if (findResponse.status() !== 200) {
            console.log(`⚠ Could not search for user: ${email}`)
            await apiContext.dispose()
            return { success: true }
        }

        const result = await findResponse.json()
        if (!result.docs || result.docs.length === 0) {
            console.log(`⚠ User not found for deletion: ${email}`)
            await apiContext.dispose()
            return { success: true }
        }

        // Delete each matching document
        for (const doc of result.docs) {
            const deleteResponse = await apiContext.delete(`${couchDbUrl}/${dbName}/${doc._id}?rev=${doc._rev}`)

            if (deleteResponse.status() === 200) {
                console.log(`✓ Deleted user from CouchDB: ${email}`)
            } else {
                const body = await deleteResponse.text()
                console.error(`✗ Failed to delete user ${email}: ${deleteResponse.status()} - ${body}`)
            }
        }

        await apiContext.dispose()
        return { success: true }
    } catch (error) {
        console.error(`✗ Error deleting user ${email}:`, error)
        await apiContext.dispose()
        return { success: false, error: String(error) }
    }
}

/**
 * Check if a user exists in CouchDB
 */
export async function userExistsInCouchDb(email: string): Promise<boolean> {
    const apiContext = await request.newContext()
    const couchDbUrl = getCouchDbAuthUrl()
    const dbName = config.couchdb.usersDbName

    try {
        const findResponse = await apiContext.post(`${couchDbUrl}/${dbName}/_find`, {
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                selector: {
                    email: email,
                },
                fields: ['_id'],
                limit: 1,
            },
        })

        const result = await findResponse.json()
        await apiContext.dispose()
        return result.docs && result.docs.length > 0
    } catch (error) {
        await apiContext.dispose()
        return false
    }
}

/**
 * Create all test users in CouchDB
 */
export async function createAllTestUsers(): Promise<void> {
    console.log('\n📋 Creating test users in CouchDB for role-based testing...')

    for (const [role, user] of Object.entries(testUsers)) {
        await createUserInCouchDb(user)
    }

    console.log('✓ Test user setup complete\n')
}

/**
 * Delete all test users from CouchDB
 */
export async function deleteAllTestUsers(): Promise<void> {
    console.log('\n🧹 Cleaning up test users from CouchDB...')

    for (const [role, user] of Object.entries(testUsers)) {
        await deleteUserFromCouchDb(user.email)
    }

    console.log('✓ Test user cleanup complete\n')
}
