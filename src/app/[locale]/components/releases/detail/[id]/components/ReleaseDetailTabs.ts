// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import CommonTabIds from '@/object-types/enums/CommonTabsIds'
import ReleaseTabIds from '@/object-types/enums/ReleaseTabIds'

const WITHOUT_COMMERCIAL_DETAILS = [
    {
        id: CommonTabIds.SUMMARY,
        name: 'Summary',
    },
    {
        id: ReleaseTabIds.LINKED_RELEASES,
        name: 'Linked Releases',
    },
    {
        id: ReleaseTabIds.CLEARING_DETAILS,
        name: 'Clearing Details',
    },
    {
        id: ReleaseTabIds.ECC_DETAILS,
        name: 'ECC Details',
    },
    {
        id: CommonTabIds.ATTACHMENTS,
        name: 'Attachments',
    },
    {
        id: CommonTabIds.VULNERABILITIES,
        name: 'Vulnerabilities',
    },
    {
        id: CommonTabIds.CHANGE_LOG,
        name: 'Change Log',
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
        id: ReleaseTabIds.CLEARING_DETAILS,
        name: 'Clearing Details',
    },
    {
        id: ReleaseTabIds.ECC_DETAILS,
        name: 'ECC Details',
    },
    {
        id: CommonTabIds.ATTACHMENTS,
        name: 'Attachments',
    },
    {
        id: ReleaseTabIds.COMMERCIAL_DETAILS,
        name: 'Commercial Details',
    },
    {
        id: CommonTabIds.VULNERABILITIES,
        name: 'Vulnerabilities',
    },
    {
        id: CommonTabIds.CHANGE_LOG,
        name: 'Change Log',
    },
]

const ReleaseDetailTabs = {
    WITHOUT_COMMERCIAL_DETAILS,
    WITH_COMMERCIAL_DETAILS
}

export default ReleaseDetailTabs
