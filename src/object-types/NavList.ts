// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.
// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { NavItem, UserGroupType } from '@/object-types'
import { useTranslations } from 'next-intl'

function NavList(): NavItem[] {
    const t = useTranslations('default')

    return [
        { href: '/home', name: t('Home'), id: 'home' },
        { href: '/projects', name: t('Projects'), id: 'projects' },
        { href: '/components', name: t('Components'), id: 'components' },
        { href: '/packages', name: t('Packages'), id: 'packages' },
        { href: '/licenses', name: t('Licenses'), id: 'licenses' },
        { href: '/ecc', name: t('ECC'), id: 'ecc' },
        { href: '/vulnerabilities', name: t('Vulnerabilities'), id: 'vulnerabilities' },
        { href: '/requests', name: t('Requests'), id: 'requests' },
        { href: '/search', name: t('Search'), id: 'search' },
        {
            href: '/admin',
            name: t('Admin'),
            id: 'admin',
            visibility: [UserGroupType.ADMIN, UserGroupType.SW360_ADMIN],
            childs: [
                { href: '/admin/users', name: t('User'), id: 'admin_user' },
                { href: '/admin/vendors', name: t('Vendors'), id: 'admin_vendors' },
                { href: '#', name: t('Bulk Release Edit'), id: 'admin_bulk_edit' },
                { href: '/admin/licenses', name: t('Licenses'), id: 'admin_licenses' },
                { href: '/admin/obligations', name: t('Obligations'), id: 'admin_obligations' },
                { href: '/admin/schedule', name: t('Schedule'), id: 'admin_schedule' },
                { href: '/admin/fossology', name: t('Fossology'), id: 'admin_fossology' },
                { href: '#', name: t('Import Export'), id: 'admin_import_export' },
                { href: '/admin/databaseSanitation', name: t('Database Sanitation'), id: 'admin_database_sanitation' },
                { href: '#', name: t('Attachment Cleanup'), id: 'admin_attachment_cleanup' },
                { href: '/admin/oauthclient', name: t('OAuth Client'), id: 'admin_oauth_client' },
                { href: '#', name: t('License Types'), id: 'admin_license_types' },
                { href: '/admin/departments', name: t('Department'), id: 'admin_department' },
                { href: '/admin/configurations', name: t('Configurations'), id: 'configurations' },
            ],
        },
    ]
}

export default NavList
