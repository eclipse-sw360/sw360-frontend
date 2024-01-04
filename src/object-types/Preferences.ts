// Copyright (C) Helio Chissini de Castro 2024, Part of the SW360 Frontend Project.
// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { useTranslations } from 'next-intl'

function Preferences() {
    const t = useTranslations('default')

    const PROJECT_PREFERENCES = [
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
            name: t('Moderator'),
        },
        {
            id: 'projectCONTRIBUTORS',
            name: t('Contributor'),
        },
        {
            id: 'projectSECURITY_RESPONSIBLES',
            name: t('Security Responsible'),
        },
        {
            id: 'projectROLES',
            name: t('Additional Role'),
        },
    ]

    const RELEASE_PREFERENCES = [
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
            name: t('Moderator'),
        },
        {
            id: 'releaseSUBSCRIBERS',
            name: t('Subcriber'),
        },
        {
            id: 'releaseROLES',
            name: t('Additional Role'),
        },
    ]
    const CLEARING_PREFERENCES = [
        {
            id: 'clearingREQUESTING_USER',
            name: t('Requesting User'),
        },
    ]

    const MODERATION_PREFERENCES = [
        {
            id: 'moderationREQUESTING_USER',
            name: t('Requesting User'),
        },
        {
            id: 'moderationMODERATORS',
            name: t('Moderator'),
        },
    ]

    const COMPONENT_PREFERENCES = [
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
            name: t('Moderator'),
        },
        {
            id: 'componentSUBSCRIBERS',
            name: t('Subcriber'),
        },
        {
            id: 'componentROLES',
            name: t('Additional Role'),
        },
    ]

    return {
        PROJECT: PROJECT_PREFERENCES,
        RELEASE: RELEASE_PREFERENCES,
        MODERATION: MODERATION_PREFERENCES,
        COMPONENT: COMPONENT_PREFERENCES,
        CLEARING: CLEARING_PREFERENCES,
    }
}

export default Preferences
