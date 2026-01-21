// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Dispatch, type JSX, SetStateAction, useEffect } from 'react'
import { Tab, Tabs } from 'react-bootstrap'
import { ActionType, ObligationEntry, ObligationType } from '@/object-types'
import LicenseObligation from './LicenseObligation'
import ObligationTab from './ObligationTab'

interface Props {
    projectId: string
    actionType: ActionType
    payload?: ObligationEntry
    setPayload?: Dispatch<SetStateAction<ObligationEntry>>
}

export default function ObligationView({ projectId, actionType, payload, setPayload }: Props): JSX.Element {
    const t = useTranslations('default')
    const { status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            void signOut()
        }
    }, [
        status,
    ])

    return (
        <Tabs
            defaultActiveKey='license-obligation'
            className='mb-3'
            mountOnEnter={true}
            unmountOnExit={true}
        >
            <Tab
                eventKey='license-obligation'
                title={t('License Obligation')}
            >
                <LicenseObligation
                    projectId={projectId}
                    actionType={actionType}
                    payload={payload}
                    setPayload={setPayload}
                />
            </Tab>
            <Tab
                eventKey='component-obligation'
                title={t('Component Obligation')}
            >
                <ObligationTab
                    projectId={projectId}
                    actionType={actionType}
                    payload={payload}
                    setPayload={setPayload}
                    obligationType={ObligationType.COMPONENT_OBLIGATION}
                />
            </Tab>
            <Tab
                eventKey='project-obligation'
                title={t('Project Obligation')}
            >
                <ObligationTab
                    projectId={projectId}
                    actionType={actionType}
                    payload={payload}
                    setPayload={setPayload}
                    obligationType={ObligationType.PROJECT_OBLIGATION}
                />
            </Tab>
            <Tab
                eventKey='organisation-obligation'
                title={t('Organisation Obligation')}
            >
                <ObligationTab
                    projectId={projectId}
                    actionType={actionType}
                    payload={payload}
                    setPayload={setPayload}
                    obligationType={ObligationType.ORGANISATION_OBLIGATION}
                />
            </Tab>
        </Tabs>
    )
}
