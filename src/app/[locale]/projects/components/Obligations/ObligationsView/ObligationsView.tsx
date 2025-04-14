// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { Dispatch, SetStateAction, type JSX } from 'react';
import { Tab, Tabs } from 'react-bootstrap'
import { useTranslations } from 'next-intl'
import LicenseObligation from './LicenseObligation'
import { ActionType, ComponentObligationData,
         LicenseObligationData, ProjectObligationData,
         OrganizationObligationData } from '@/object-types'
import ComponentObligation from './ComponentObligation';
import ProjectObligation from './ProjectObligation';
import OrganizationObligation from './OrganizationObligation';

interface Props {
    projectId: string,
    actionType: ActionType,
    payload?: LicenseObligationData |
              ComponentObligationData |
              ProjectObligationData|
              OrganizationObligationData,
    setPayload?: Dispatch<SetStateAction<LicenseObligationData |
                                         ComponentObligationData |
                                         ProjectObligationData|
                                         OrganizationObligationData>>,
    selectedProjectId: string | null
}

export default function ObligationView({ projectId, actionType,
                                         payload, setPayload,
                                         selectedProjectId }: Props): JSX.Element {
    const t = useTranslations('default')
    return (
        <Tabs defaultActiveKey='license-obligation' className='mb-3'
              mountOnEnter={true} unmountOnExit={true}
        >
            <Tab eventKey='license-obligation' title={t('License Obligation')}>
                <LicenseObligation projectId={projectId}
                                   actionType={actionType}
                                   payload={payload}
                                   setPayload={setPayload}
                                   selectedProjectId={selectedProjectId}
                />
            </Tab>
            <Tab eventKey='component-obligation' title={t('Component Obligation')}>
                <ComponentObligation
                                   projectId={projectId}
                                   actionType={actionType}
                                   payload={payload}
                                   setPayload={setPayload}
                />
            </Tab>
            <Tab eventKey='project-obligation' title={t('Project Obligation')}>
                <ProjectObligation
                                   projectId={projectId}
                                   actionType={actionType}
                                   payload={payload}
                                   setPayload={setPayload}
                />
            </Tab>
            <Tab eventKey='organisation-obligation' title={t('Organisation Obligation')}>
                <OrganizationObligation
                                        projectId={projectId}
                                        actionType={actionType}
                                        payload={payload}
                                        setPayload={setPayload}
                />
            </Tab>
        </Tabs>
    )
}
