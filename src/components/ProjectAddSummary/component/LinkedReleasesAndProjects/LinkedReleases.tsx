// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { Table, _ } from '@/components/sw360'
import LinkedReleasesModal from '@/components/sw360/LinkedReleasesModal/LinkedReleasesModal'
import { ProjectPayload } from '@/object-types'
import { CommonUtils } from '@/utils'
import { useTranslations } from 'next-intl'
import { useEffect, useState, type JSX } from 'react'

interface Props {
    projectPayload: ProjectPayload
    existingReleaseData: Map<string, LinkedReleaseData> | undefined
    setProjectPayload: React.Dispatch<React.SetStateAction<ProjectPayload>>
}

interface LinkedReleaseData {
    comment?: string
    mainlineState: string
    name: string
    releaseRelation: string
    version: string
}

type RowData = Array<
    | string
    | {
          updatedReleaseRelation?: string
          key?: string
          updatedProjectMainlineState?: string
          updatedComment?: string
      }
>

export default function LinkedReleases({ projectPayload, existingReleaseData, setProjectPayload }: Props): JSX.Element {
    const t = useTranslations('default')
    const [showLinkedReleasesModal, setShowLinkedReleasesModal] = useState(false)
    const [linkedReleaseData, setLinkedReleaseData] = useState<Map<string, LinkedReleaseData>>(new Map())
    const [tableData, setTableData] = useState<Array<RowData>>([])

    const updateReleaseRelation = (
        releaseId: string,
        updatedReleaseRelation: string,
        linkedReleaseData: Map<string, LinkedReleaseData>,
    ) => {
        try {
            if (linkedReleaseData.has(releaseId)) {
                linkedReleaseData.forEach((value, key) => {
                    if (key === releaseId && !CommonUtils.isNullOrUndefined(projectPayload.linkedReleases)) {
                        value.releaseRelation = updatedReleaseRelation
                        setLinkedReleaseData(linkedReleaseData)
                        projectPayload.linkedReleases[releaseId].releaseRelation = updatedReleaseRelation
                        const data = extractDataFromMap(linkedReleaseData)
                        setTableData(data)
                    }
                })
            }
        } catch (e) {
            console.error(e)
        }
    }

    const updateProjectMainlineState = (
        releaseId: string,
        updatedProjectMainlineState: string,
        linkedReleaseData: Map<string, LinkedReleaseData>,
    ) => {
        try {
            if (linkedReleaseData.has(releaseId)) {
                if (projectPayload.linkedReleases === undefined) return
                linkedReleaseData.forEach((value, key) => {
                    if (key === releaseId && !CommonUtils.isNullOrUndefined(projectPayload.linkedReleases)) {
                        value.mainlineState = updatedProjectMainlineState
                        setLinkedReleaseData(linkedReleaseData)
                        projectPayload.linkedReleases[releaseId].mainlineState = updatedProjectMainlineState
                        const data = extractDataFromMap(linkedReleaseData)
                        setTableData(data)
                    }
                })
            }
        } catch (e) {
            console.error(e)
        }
    }

    const handleComments = (
        releaseId: string,
        updatedComment: string,
        linkedReleaseData: Map<string, LinkedReleaseData>,
    ) => {
        try {
            if (linkedReleaseData.has(releaseId)) {
                linkedReleaseData.forEach((value, key) => {
                    if (key === releaseId && !CommonUtils.isNullOrUndefined(projectPayload.linkedReleases)) {
                        value.comment = updatedComment
                        setLinkedReleaseData(linkedReleaseData)
                        projectPayload.linkedReleases[releaseId].comment = updatedComment
                        const data = extractDataFromMap(linkedReleaseData)
                        setTableData(data)
                    }
                })
            }
        } catch (e) {
            console.error(e)
        }
    }

    const extractDataFromMap = (linkedReleaseData: Map<string, LinkedReleaseData>) => {
        const extractedData: Array<RowData> = []
        linkedReleaseData.forEach((value, key) => {
            const updatedReleaseRelation = value.releaseRelation
            const updatedProjectMainlineState = value.mainlineState
            const updatedComment = value.comment
            extractedData.push([
                value.name,
                value.version,
                { updatedReleaseRelation, key },
                { updatedProjectMainlineState, key },
                { updatedComment, key },
            ])
        })
        return extractedData
    }

    useEffect(() => {
        if (existingReleaseData !== undefined && linkedReleaseData.size === 0) {
            const data = extractDataFromMap(existingReleaseData)
            setTableData(data)
            setLinkedReleaseData(existingReleaseData)
        } else {
            const data = extractDataFromMap(linkedReleaseData)
            setTableData(data)
        }
    }, [existingReleaseData, linkedReleaseData])

    const columns = [
        {
            id: 'linkedReleaseData.name',
            name: 'Release Name',
            sort: true,
        },
        {
            id: 'linkedReleaseData.version',
            name: 'Release Version',
            sort: true,
        },
        {
            id: 'linkedReleaseData.releaseRelation',
            name: 'Release Relation',
            sort: true,
            formatter: ({ releaseRelation, key }: { releaseRelation: string; key: string }) =>
                _(
                    <div className='form-dropdown'>
                        <select
                            className='form-select'
                            id='linkedReleaseData.releaseRelation'
                            aria-describedby='linkedReleaseData.releaseRelation.HelpBlock'
                            name='releaseRelation'
                            value={linkedReleaseData.get(key)?.releaseRelation ?? releaseRelation}
                            onChange={(event) => {
                                const updatedReleaseRelationStatus = event.target.value
                                updateReleaseRelation(key, updatedReleaseRelationStatus, linkedReleaseData)
                            }}
                            required
                        >
                            <option value='UNKNOWN'>{t('Unknown')}</option>
                            <option value='CONTAINED'>{t('Contained')}</option>
                            <option value='REFERRED'>{t('Related')}</option>
                            <option value='DYNAMICALLY_LINKED'>{t('Dynamically linked')}</option>
                            <option value='STATICALLY_LINKED'>{t('Statically linked')}</option>
                            <option value='SIDE_BY_SIDE'>{t('Side by side')}</option>
                            <option value='STANDALONE'>{t('Standalone')}</option>
                            <option value='INTERNAL_USE'>{t('Internal use')}</option>
                            <option value='OPTIONAL'>{t('Optional')}</option>
                            <option value='TO_BE_REPLACED'>{t('To be replaced')}</option>
                            <option value='CODE_SNIPPET'>{t('Code snippet')}</option>
                        </select>
                    </div>,
                ),
        },
        {
            id: 'linkedReleaseData.mainlineState',
            name: 'Project Mainline State',
            sort: true,
            formatter: ({ mainlineState, key }: { mainlineState: string; key: string }) =>
                _(
                    <div className='form-dropdown'>
                        <select
                            className='form-select'
                            id='linkedReleaseData.mainlineState'
                            aria-describedby='linkedReleaseData.mainlineState'
                            name='mainlineState'
                            value={linkedReleaseData.get(key)?.mainlineState ?? mainlineState}
                            onChange={(event) => {
                                const updatedProjectMainlineState = event.target.value
                                updateProjectMainlineState(key, updatedProjectMainlineState, linkedReleaseData)
                            }}
                            required
                        >
                            <option value='OPEN'>{t('Open')}</option>
                            <option value='MAINLINE'>{t('Mainline')}</option>
                            <option value='SPECIFIC'>{t('Specific')}</option>
                            <option value='PHASEOUT'>{t('Phaseout')}</option>
                            <option value='DENIED'>{t('Denied')}</option>
                        </select>
                    </div>,
                ),
        },
        {
            id: 'linkedReleaseData.comment',
            name: 'Comments',
            sort: true,
            formatter: ({ comments, key }: { comments: string; key: string }) =>
                _(
                    <div className='col-lg-9'>
                        <input
                            type='text'
                            className='form-control'
                            placeholder='Enter Comments'
                            id='linkedReleaseData.comment'
                            aria-describedby='linkedReleaseData.comment'
                            name='comment'
                            defaultValue={linkedReleaseData.get(key)?.comment ?? comments}
                            onBlur={(event) => {
                                const updatedComment = event.target.value
                                handleComments(key, updatedComment, linkedReleaseData)
                            }}
                        />
                    </div>,
                ),
        },
    ]

    return (
        <>
            <LinkedReleasesModal
                setLinkedReleaseData={setLinkedReleaseData}
                projectPayload={projectPayload}
                setProjectPayload={setProjectPayload}
                show={showLinkedReleasesModal}
                setShow={setShowLinkedReleasesModal}
            />
            <div className='row mb-4'>
                <div className='row header-1'>
                    <h6
                        className='fw-medium'
                        style={{ color: '#5D8EA9', paddingLeft: '0px' }}
                    >
                        {t('LINKED RELEASES')}
                        <hr
                            className='my-2 mb-2'
                            style={{ color: '#5D8EA9', paddingLeft: '0px' }}
                        />
                    </h6>
                </div>
                <div style={{ paddingLeft: '0px' }}>
                    <Table
                        data={tableData}
                        columns={columns}
                        sort={false}
                    />
                </div>
                <div
                    className='row'
                    style={{ paddingLeft: '0px' }}
                >
                    <div className='col-lg-4'>
                        <button
                            type='button'
                            className='btn btn-secondary'
                            onClick={() => setShowLinkedReleasesModal(true)}
                        >
                            {t('Link Releases')}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
