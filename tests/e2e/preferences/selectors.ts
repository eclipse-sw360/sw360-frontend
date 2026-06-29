// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

/**
 * Centralized selectors for the Preferences module E2E tests.
 */
export const selectors = {
    page: {
        container: '.container.page-content',
    },
    notifications: {
        heading: '#preferences-title',
        emailCheckbox: '#wants_mail_notification',
        alertInfo: '.alert-info',
        accordion: '.accordion',
        accordionItems: '.accordion-item',
        accordionHeaders: '.accordion-header button',
    },
    userInfo: {
        name: '#user-name',
        email: '#user-email',
        department: '#user-department',
        externalId: '#user-external-id',
        role: '#user-role',
        secondaryDepts: '#user-secondary-departments-roles',
    },
    token: {
        nameInput: '#rest_token',
        readCheckbox: '#authorities_read',
        writeCheckbox: '#authorities_write',
        expirationInput: 'input[type="date"]',
        generateButton: 'button:has-text("Generate Token")',
        generatedToken: '#accesstoken',
        form: '#generateTokenForm',
        table: '.sw360-table',
        tableHeaders: '.sw360-table thead th',
    },
    buttons: {
        updateSettings: 'button:has-text("Update settings")',
    },
}
