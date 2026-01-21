// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { useSession } from 'next-auth/react'
import { CommonTabIds, ReleaseTabIds, UserGroupType } from '@/object-types'

export function ReleaseDetailTabs() {
    const { data: session } = useSession()

    const WITHOUT_COMMERCIAL_DETAILS_AND_SPDX = [
        {
            id: CommonTabIds.SUMMARY,
            name: 'Summary',
        },
        {
            id: ReleaseTabIds.LINKED_RELEASES,
            name: 'Linked Releases',
        },
        {
            id: ReleaseTabIds.LINKED_PACKAGES,
            name: 'Linked Packages',
            hidden: session?.user?.userGroup === UserGroupType.SECURITY_USER,
        },
        {
            id: ReleaseTabIds.CLEARING_DETAILS,
            name: 'Clearing Details',
            hidden: session?.user?.userGroup === UserGroupType.SECURITY_USER,
        },
        {
            id: ReleaseTabIds.ECC_DETAILS,
            name: 'ECC Details',
            hidden: session?.user?.userGroup === UserGroupType.SECURITY_USER,
        },
        {
            id: CommonTabIds.ATTACHMENTS,
            name: 'Attachments',
            hidden: session?.user?.userGroup === UserGroupType.SECURITY_USER,
        },
        {
            id: CommonTabIds.VULNERABILITIES,
            name: 'Vulnerabilities',
        },
        {
            id: CommonTabIds.CHANGE_LOG,
            name: 'Change Log',
            hidden: session?.user?.userGroup === UserGroupType.SECURITY_USER,
        },
    ]

    const WITH_COMMERCIAL_DETAILS = [
        {
            id: CommonTabIds.SUMMARY,
            name: 'Summary',
        },
        {
            id: ReleaseTabIds.LINKED_RELEASES,
            name: 'Linked Releases',
        },
        {
            id: ReleaseTabIds.LINKED_PACKAGES,
            name: 'Linked Packages',
            hidden: session?.user?.userGroup === UserGroupType.SECURITY_USER,
        },
        {
            id: ReleaseTabIds.CLEARING_DETAILS,
            name: 'Clearing Details',
            hidden: session?.user?.userGroup === UserGroupType.SECURITY_USER,
        },
        {
            id: ReleaseTabIds.ECC_DETAILS,
            name: 'ECC Details',
            hidden: session?.user?.userGroup === UserGroupType.SECURITY_USER,
        },
        {
            id: CommonTabIds.ATTACHMENTS,
            name: 'Attachments',
            hidden: session?.user?.userGroup === UserGroupType.SECURITY_USER,
        },
        {
            id: ReleaseTabIds.COMMERCIAL_DETAILS,
            name: 'Commercial Details',
            hidden: session?.user?.userGroup === UserGroupType.SECURITY_USER,
        },
        {
            id: CommonTabIds.VULNERABILITIES,
            name: 'Vulnerabilities',
        },
        {
            id: CommonTabIds.CHANGE_LOG,
            name: 'Change Log',
            hidden: session?.user?.userGroup === UserGroupType.SECURITY_USER,
        },
    ]

    const MODERATION_REQUEST = [
        {
            id: CommonTabIds.SUMMARY,
            name: 'Summary',
        },
        {
            id: ReleaseTabIds.LINKED_RELEASES,
            name: 'Linked Releases',
        },
        {
            id: ReleaseTabIds.LINKED_PACKAGES,
            name: 'Linked Packages',
            hidden: session?.user?.userGroup === UserGroupType.SECURITY_USER,
        },
        {
            id: ReleaseTabIds.CLEARING_DETAILS,
            name: 'Clearing Details',
            hidden: session?.user?.userGroup === UserGroupType.SECURITY_USER,
        },
        {
            id: ReleaseTabIds.ECC_DETAILS,
            name: 'ECC Details',
            hidden: session?.user?.userGroup === UserGroupType.SECURITY_USER,
        },
        {
            id: CommonTabIds.ATTACHMENTS,
            name: 'Attachments',
            hidden: session?.user?.userGroup === UserGroupType.SECURITY_USER,
        },
        {
            id: CommonTabIds.CHANGE_LOG,
            name: 'Change Log',
            hidden: session?.user?.userGroup === UserGroupType.SECURITY_USER,
        },
    ]

    const WITH_SPDX = [
        {
            id: CommonTabIds.SUMMARY,
            name: 'Summary',
        },
        {
            id: ReleaseTabIds.SPDX_DOCUMENT,
            name: 'SPDX Document',
            hidden: session?.user?.userGroup === UserGroupType.SECURITY_USER,
        },
        {
            id: ReleaseTabIds.LINKED_RELEASES,
            name: 'Linked Releases',
        },
        {
            id: ReleaseTabIds.LINKED_PACKAGES,
            name: 'Linked Packages',
            hidden: session?.user?.userGroup === UserGroupType.SECURITY_USER,
        },
        {
            id: ReleaseTabIds.CLEARING_DETAILS,
            name: 'Clearing Details',
            hidden: session?.user?.userGroup === UserGroupType.SECURITY_USER,
        },
        {
            id: ReleaseTabIds.ECC_DETAILS,
            name: 'ECC Details',
            hidden: session?.user?.userGroup === UserGroupType.SECURITY_USER,
        },
        {
            id: CommonTabIds.ATTACHMENTS,
            name: 'Attachments',
            hidden: session?.user?.userGroup === UserGroupType.SECURITY_USER,
        },
        {
            id: CommonTabIds.VULNERABILITIES,
            name: 'Vulnerabilities',
        },
        {
            id: CommonTabIds.CHANGE_LOG,
            name: 'Change Log',
            hidden: session?.user?.userGroup === UserGroupType.SECURITY_USER,
        },
    ]

    const WITH_COMMERCIAL_DETAILS_AND_SPDX = [
        {
            id: CommonTabIds.SUMMARY,
            name: 'Summary',
        },
        {
            id: ReleaseTabIds.SPDX_DOCUMENT,
            name: 'SPDX Document',
            hidden: session?.user?.userGroup === UserGroupType.SECURITY_USER,
        },
        {
            id: ReleaseTabIds.LINKED_RELEASES,
            name: 'Linked Releases',
        },
        {
            id: ReleaseTabIds.CLEARING_DETAILS,
            name: 'Clearing Details',
            hidden: session?.user?.userGroup === UserGroupType.SECURITY_USER,
        },
        {
            id: ReleaseTabIds.ECC_DETAILS,
            name: 'ECC Details',
            hidden: session?.user?.userGroup === UserGroupType.SECURITY_USER,
        },
        {
            id: CommonTabIds.ATTACHMENTS,
            name: 'Attachments',
            hidden: session?.user?.userGroup === UserGroupType.SECURITY_USER,
        },
        {
            id: ReleaseTabIds.COMMERCIAL_DETAILS,
            name: 'Commercial Details',
            hidden: session?.user?.userGroup === UserGroupType.SECURITY_USER,
        },
        {
            id: CommonTabIds.VULNERABILITIES,
            name: 'Vulnerabilities',
        },
        {
            id: CommonTabIds.CHANGE_LOG,
            name: 'Change Log',
            hidden: session?.user?.userGroup === UserGroupType.SECURITY_USER,
        },
    ]

    return {
        WITH_COMMERCIAL_DETAILS,
        MODERATION_REQUEST,
        WITH_SPDX,
        WITHOUT_COMMERCIAL_DETAILS_AND_SPDX,
        WITH_COMMERCIAL_DETAILS_AND_SPDX,
    }
}
