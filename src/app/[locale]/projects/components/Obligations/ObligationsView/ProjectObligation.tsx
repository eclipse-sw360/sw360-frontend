// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { Table, _ } from '@/components/sw360'
import { ActionType, HttpStatus, ProjectObligationData } from '@/object-types'
import MessageService from '@/services/message.service'
import CommonUtils from '@/utils/common.utils'
import { ApiUtils } from '@/utils/index'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { notFound } from 'next/navigation'
import { Dispatch, SetStateAction, useEffect, useState, type JSX } from 'react'
import { OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap'
import { ObligationLevels } from '../../../../../../object-types/Obligation'
import { ShowObligationTextOnExpand } from './ExpandableComponents'
import UpdateCommentModal from './UpdateCommentModal'

interface Props {
    projectId: string
    actionType: ActionType
    payload?: ProjectObligationData
    setPayload?: Dispatch<SetStateAction<ProjectObligationData>>
}

interface UpdateCommentModalMetadata {
    obligation: string
    comment?: string
}

interface ProjectObligations {
    obligations: ProjectObligationData
}

const Capitalize = (text: string) =>
    text.split('_').reduce((s, c) => s + ' ' + (c.charAt(0) + c.substring(1).toLocaleLowerCase()), '')

export default function ProjectObligation({ projectId, actionType, payload, setPayload }: Props): JSX.Element {
    const t = useTranslations('default')
    const { status } = useSession()
    const [tableData, setTableData] = useState<(object | string | string[])[][] | null>(null)
    const [projectObligations, setProjectObligations] = useState<null | ProjectObligations>(null)
    const [updateCommentModalData, setUpdateCommentModalData] = useState<UpdateCommentModalMetadata | null>(null)

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [status])

    const columns =
        actionType === ActionType.DETAIL
            ? [
                  {
                      id: 'projectObligation.expand',
                      formatter: ({ id, infoText }: { id: string; infoText: string }) =>
                          _(
                              <ShowObligationTextOnExpand
                                  id={id}
                                  infoText={infoText}
                                  colLength={columns.length}
                              />,
                          ),
                      width: '4%',
                  },
                  {
                      id: 'projectObligation.projectObligation',
                      name: t('Project Obligation'),
                      formatter: ({ oblTitle }: { oblTitle: string }) =>
                          _(
                              <div className='text-center'>
                                  <span>{oblTitle}</span>
                              </div>,
                          ),
                      sort: true,
                  },
                  {
                      id: 'projectObligation.status',
                      name: t('Status'),
                      formatter: ({ status }: { status: string }) => {
                          return _(<>{Capitalize(status)}</>)
                      },
                      sort: true,
                  },
                  {
                      id: 'projectObligation.type',
                      name: t('Type'),
                      sort: true,
                  },
                  {
                      id: 'projectObligation.id',
                      name: t('Id'),
                      sort: true,
                  },
                  {
                      id: 'projectObligation.comment',
                      name: t('Comment'),
                      formatter: ({ comment }: { comment: string }) => _(<p>{comment}</p>),
                      sort: true,
                  },
              ]
            : [
                  {
                      id: 'projectObligation.expand',
                      formatter: (param: { id?: string; infoText?: string }) => {
                          const { id, infoText } = param
                          return _(
                              <>
                                  {' '}
                                  {id !== undefined && infoText !== undefined ? (
                                      <ShowObligationTextOnExpand
                                          id={id}
                                          infoText={infoText}
                                          colLength={columns.length}
                                      />
                                  ) : (
                                      ''
                                  )}
                              </>,
                          )
                      },
                      width: '4%',
                  },
                  {
                      id: 'projectObligation.projectObligation',
                      name: t('Project Obligation'),
                      formatter: ({ oblTitle }: { oblTitle: string }) =>
                          _(
                              <div className='text-center'>
                                  <OverlayTrigger overlay={<Tooltip>t({`${oblTitle}`})</Tooltip>}>
                                      <span> {oblTitle} </span>
                                  </OverlayTrigger>
                              </div>,
                          ),
                      sort: true,
                  },
                  {
                      id: 'projectObligation.status',
                      name: t('Status'),
                      formatter: ({ obligation, status }: { obligation: string; status: string }) => {
                          return _(
                              <select
                                  className='form-select'
                                  id='projectObligation.edit.status'
                                  name='status'
                                  value={payload?.[obligation]?.status ?? (status && status === '' ? 'OPEN' : status)}
                                  onChange={(e) => {
                                      if (setPayload) {
                                          let obligationValue = payload?.[obligation] ?? {}
                                          obligationValue = {
                                              ...obligationValue,
                                              status: e.target.value,
                                              obligationType: ObligationLevels.PROJECT_OBLIGATION,
                                          }
                                          setPayload((payload: ProjectObligationData) => ({
                                              ...payload,
                                              [obligation]: obligationValue,
                                          }))
                                      }
                                  }}
                              >
                                  <option value='OPEN'>{t('Open')}</option>
                                  <option value='ACKNOWLEDGED_OR_FULFILLED'>{t('Acknowledged or Fulfilled')}</option>
                                  <option value='WILL_BE_FULFILLED_BEFORE_RELEASE'>
                                      {t('Will be fulfilled before release')}
                                  </option>
                                  <option value='NOT_APPLICABLE'>{t('Not Applicable')}</option>
                                  <option value='DEFERRED_TO_PARENT_PROJECT'>{t('Deferred to parent project')}</option>
                                  <option value='FULFILLED_AND_PARENT_MUST_ALSO_FULFILL'>
                                      {t('Fulfilled and parent must also fulfill')}
                                  </option>
                                  <option value='ESCALATED'>{t('Escalated')}</option>
                              </select>,
                          )
                      },
                      width: '10%',
                      sort: true,
                  },
                  {
                      id: 'projectObligation.type',
                      name: t('Type'),
                      sort: true,
                  },
                  {
                      id: 'projectObligation.id',
                      name: t('Id'),
                      sort: true,
                  },
                  {
                      id: 'projectObligation.comment',
                      name: t('Comment'),
                      formatter: ({ obligation, comment }: { obligation: string; comment: string }) => {
                          return _(
                              <input
                                  type='text'
                                  value={payload?.[obligation]?.comment ?? comment}
                                  onClick={() => {
                                      setUpdateCommentModalData({
                                          comment: payload?.[obligation]?.comment ?? comment,
                                          obligation,
                                      })
                                  }}
                                  className='form-control'
                                  placeholder={t('Enter comments')}
                                  readOnly
                              />,
                          )
                      },
                      sort: true,
                  },
              ]

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

        ;(async () => {
            try {
                const session = await getSession()
                if (CommonUtils.isNullOrUndefined(session)) return signOut()
                const url = `projects/${projectId}/obligation?obligationLevel=project`
                const response = await ApiUtils.GET(url, session.user.access_token, signal)
                if (response.status === HttpStatus.UNAUTHORIZED) {
                    return signOut()
                } else if (response.status !== HttpStatus.OK) {
                    return notFound()
                }
                const projectObligation = await response.json()
                setProjectObligations(projectObligation)
            } catch (error: unknown) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return
                }
                const message = error instanceof Error ? error.message : String(error)
                MessageService.error(message)
            }
        })()
        return () => controller.abort()
    }, [projectId, status])

    useEffect(() => {
        if (!projectObligations) return
        const tableRows = []
        for (const [key, val] of Object.entries(projectObligations.obligations)) {
            tableRows.push([
                {
                    id: key.split(' ').join('_'),
                    infoText: val.text ?? '',
                },
                {
                    oblTitle: key,
                },
                { obligation: key, status: val.status ?? '' },
                Capitalize(val.obligationType ?? ''),
                val.id ?? '',
                { obligation: key, comment: val.comment ?? '' },
            ])
        }
        setTableData(tableRows)
    }, [payload, projectObligations])

    return (
        <>
            <UpdateCommentModal
                modalMetaData={updateCommentModalData}
                setModalMetaData={setUpdateCommentModalData}
                payload={payload}
                setPayload={setPayload}
                obligationTypeName={ObligationLevels.PROJECT_OBLIGATION}
            />
            {tableData ? (
                <Table
                    columns={columns}
                    data={tableData}
                    selector={true}
                />
            ) : (
                <div className='col-12 d-flex justify-content-center align-items-center'>
                    <Spinner className='spinner' />
                </div>
            )}
        </>
    )
}
