// Copyright (C) Helio Chissini de Castro 2024, Part of the SW360 Frontend Project.
// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { useTranslations } from 'next-intl'

function Preferences(): {
    key: string
    documentType: string
    entries: {
        id: string
        name: string
    }[]
}[] {
    const t = useTranslations('default')

    const PREFERENCES = [
        {
            key: 'project',
            documentType: t('Project'),
            entries: [
                {
                    id: 'projectPROJECT_RESPONSIBLE',
                    name: t('Project Responsible'),
                },
                {
                    id: 'projectPROJECT_OWNER',
                    name: t('Project Owner'),
                },
                {
                    id: 'projectLEAD_ARCHITECT',
                    name: t('Lead Architect'),
                },
                {
                    id: 'projectMODERATORS',
                    name: t('Moderators'),
                },
                {
                    id: 'projectCONTRIBUTORS',
                    name: t('Contributor'),
                },
                {
                    id: 'projectSECURITY_RESPONSIBLES',
                    name: t('Security Responsibles'),
                },
                {
                    id: 'projectROLES',
                    name: t('Additional Role'),
                },
            ],
        },

        {
            key: 'component',
            documentType: t('Component'),
            entries: [
                {
                    id: 'componentCREATED_BY',
                    name: t('Creator'),
                },
                {
                    id: 'componentCOMPONENT_OWNER',
                    name: t('Component Owner'),
                },
                {
                    id: 'componentMODERATORS',
                    name: t('Moderators'),
                },
                {
                    id: 'componentSUBSCRIBERS',
                    name: t('Subscribers'),
                },
                {
                    id: 'componentROLES',
                    name: t('Additional Role'),
                },
            ],
        },

        {
            key: 'release',
            documentType: t('Release'),
            entries: [
                {
                    id: 'releaseCREATED_BY',
                    name: t('Creator'),
                },
                {
                    id: 'releaseCONTRIBUTORS',
                    name: t('Contributor'),
                },
                {
                    id: 'releaseMODERATORS',
                    name: t('Moderators'),
                },
                {
                    id: 'releaseSUBSCRIBERS',
                    name: t('Subscribers'),
                },
                {
                    id: 'releaseROLES',
                    name: t('Additional Role'),
                },
            ],
        },

        {
            key: 'moderation',
            documentType: t('Moderation'),
            entries: [
                {
                    id: 'moderationREQUESTING_USER',
                    name: t('Requesting User'),
                },
                {
                    id: 'moderationMODERATORS',
                    name: t('Moderators'),
                },
            ],
        },

        {
            key: 'clearing',
            documentType: t('Clearing'),
            entries: [
                {
                    id: 'clearingREQUESTING_USER',
                    name: t('Requesting User'),
                },
            ],
        },
    ]

    return PREFERENCES
}

export default Preferences
