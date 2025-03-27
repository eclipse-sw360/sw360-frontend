// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { Table, _ } from '@/components/sw360'
import { ActionType, HttpStatus, ComponentObligation } from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Dispatch, SetStateAction, useEffect, useState, type JSX } from 'react'
import { OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap'
import { ShowObligationTextOnExpand } from './ExpandableComponents'
import { notFound } from 'next/navigation'

const Capitalize = (text: string) =>
    text.split('_').reduce((s, c) => s + ' ' + (c.charAt(0) + c.substring(1).toLocaleLowerCase()), '')

interface ProjectsComponentObligations {
    obligations : ComponentObligation
}

interface Props {
    projectId: string,
    actionType: ActionType,
    payload?: ComponentObligation,
    setPayload?: Dispatch<SetStateAction<ComponentObligation>>
}

export default function ProjectsComponentObligation(
                            { projectId, actionType,
                              payload, setPayload
                            }: Props): JSX.Element {
    const t = useTranslations('default')
    const { status } = useSession()
    const [tableData] = useState<(object | string | string[])[][] | null>(null)
    const [projectsComponentObligations, setProjectsComponentObligations] =
                            useState<null | ProjectsComponentObligations>(null)
    const columns = (actionType === ActionType.DETAIL) ? 
     [
        {
            id: 'componentObligation.expand',
            formatter: ({ id, infoText }: { id: string, infoText: string }) =>
                _(
                    <ShowObligationTextOnExpand id={id}
                                                infoText={infoText}
                                                colLength={columns.length} />
                ),
            width: '4%'
        },
        {
            id: 'componentObligation.componentObligation',
            name: t('License Obligation'),
            formatter: ({ oblTitle }: { oblTitle: string }) =>
                _(
                    <div className='text-center'>
                        <span >{oblTitle}</span>
                    </div>
                ),
            sort: true,
        },
        {
            id: 'componentObligation.status',
            name: t('Status'),
            formatter: ({ status }: { status: string }) => {
                return _(
                    <>{Capitalize(status)}</>
                )
            },
            sort: true,
        },
        {
            id: 'componentObligation.type',
            name: t('Type'),
            sort: true,
        },
        {
            id: 'componentObligation.id',
            name: t('Id'),
            sort: true,
        },
        {
            id: 'componentObligation.comment',
            name: t('Comment'),
            formatter: ({ comment }: { comment: string }) =>
                _(
                    <p>{comment}</p>
                ),
            sort: true,
        }
    ]
    : [
        {
            id: 'componentObligation.expand',
            formatter: (param: { id?: string; infoText?: string }) => {
                const { id, infoText } = param;
                return _(<>{
                    id !== undefined && infoText !== undefined ? (
                        <ShowObligationTextOnExpand id={id}
                                                    infoText={infoText}
                                                    colLength={columns.length} />
                    ) : ""
                }</>)
            },
            width: '4%'
        },
        {
            id: 'componentObligation.componentObligation',
            name: t('Component Obligation'),
            formatter: ({ oblTitle }: { oblTitle: string }) =>
                _(
                    <div className='text-center'>
                        <OverlayTrigger
                            overlay=
                                {
                                    <Tooltip>
                                        t({`${oblTitle}`})
                                    </Tooltip>
                                }
                        >
                            <span> {oblTitle} </span>
                        </OverlayTrigger>
                    </div>
                ),
            sort: true,
        },
        {
            id: 'componentObligation.status',
            name: t('Status'),
            formatter: ({ obligation, status }: {
                          obligation: string,
                          status: string }) => {
                return _(
                    <select
                        className='form-select'
                        id='componentObligation.edit.status'
                        name='status'
                        value={payload?.[obligation]?.status
                                ?? ((status && status === '') ? 'OPEN' : status)}
                        onChange={(e) => {
                            if (setPayload) {
                                let obligationValue = payload?.[obligation] ?? {}
                                obligationValue = { ...obligationValue, status: e.target.value }
                                setPayload((payload: ComponentObligation) =>
                                    ({ ...payload, [obligation]: obligationValue })
                                )
                            }
                        }}
                    >
                        <option value='OPEN'>
                            {t('Open')}
                        </option>
                        <option value='ACKNOWLEDGED_OR_FULFILLED'>
                            {t('Acknowledged or Fulfilled')}
                        </option>
                        <option value='WILL_BE_FULFILLED_BEFORE_RELEASE'>
                            {t('Will be fulfilled before release')}
                        </option>
                        <option value='NOT_APPLICABLE'>
                            {t('Not Applicable')}
                        </option>
                        <option value='DEFERRED_TO_PARENT_PROJECT'>
                            {t('Deferred to parent project')}
                        </option>
                        <option value='FULFILLED_AND_PARENT_MUST_ALSO_FULFILL'>
                            {t('Fulfilled and parent must also fulfill')}
                        </option>
                        <option value='ESCALATED'>
                            {t('Escalated')}
                        </option>
                    </select>
                )
            },
            width: '10%',
            sort: true,
        },
        {
            id: 'componentObligation.type',
            name: t('Type'),
            sort: true,
        },
        {
            id: 'componentObligation.id',
            name: t('Id'),
            sort: true,
        },
        {
            id: 'componentObligation.comment',
            name: t('Comment'),
            formatter: ({ obligation, comment }: {
                          obligation: string,
                          comment: string }) => {
                return _(
                    <input
                        type='text'
                        value={payload?.[obligation]?.comment ?? comment}
                        className='form-control'
                        placeholder={t('Enter comments')}
                        readOnly
                    />
                )
            },
            sort: true,
        }
    ]

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

        ;(async () => {
            try {
                const session = await getSession()
                if(CommonUtils.isNullOrUndefined(session))
                    return signOut()
                const url = `projects/${projectId}/obligation?obligationLevel=component`
                const response = await ApiUtils.GET( url,
                                                     session.user.access_token,
                                                     signal)
                if (response.status === HttpStatus.UNAUTHORIZED) {
                    return signOut()
                } else if (response.status !== HttpStatus.OK) {
                    return notFound()
                }
                const componentObligation = await response.json()
                setProjectsComponentObligations(componentObligation)
            } catch (e) {
                console.error(e)
            }
        })()
        return () => controller.abort()
    }, [projectId, status])

    console.log(projectsComponentObligations)

    return (
        <>
            {
                tableData ?
                    <Table
                        columns={columns}
                        data={tableData}
                        selector={true}
                    /> :
                    <div className='col-12 d-flex justify-content-center align-items-center'>
                        <Spinner className='spinner' />
                    </div>
            }
        </>
    )
}