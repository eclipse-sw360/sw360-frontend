// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { Embedded, HttpStatus, LinkedReleaseData, ProjectPayload, ReleaseDetail } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'
import { getSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Table, _ } from 'next-sw360'
import Link from 'next/link'
import { ChangeEvent, useRef, useState, type JSX } from 'react'
import { Button, Col, Form, Modal, Row, Spinner } from 'react-bootstrap'
import { FaInfoCircle } from 'react-icons/fa'

interface Props {
    setLinkedReleaseData: React.Dispatch<React.SetStateAction<Map<string, LinkedReleaseData>>>
    projectPayload: ProjectPayload
    setProjectPayload: React.Dispatch<React.SetStateAction<ProjectPayload>>
    show: boolean
    setShow: (show: boolean) => void
}

type RowData = (string | SummaryReleaseInfo)[]

interface SummaryReleaseInfo {
    name?: string
    componentId?: string
    releaseVersion?: string
    releaseId?: string
}

interface ReleaseRelationship {
    name?: string
    version?: string
    releaseRelation: string
    mainlineState: string
    comment?: string
}

type EmbeddedReleases = Embedded<ReleaseDetail, 'sw360:releases'>

export default function LinkedReleasesModal({
    setLinkedReleaseData,
    projectPayload,
    setProjectPayload,
    show,
    setShow,
}: Props): JSX.Element {
    const t = useTranslations('default')
    const [releaseData, setReleaseData] = useState<RowData[]>([])
    const [linkReleases, setLinkReleases] = useState<Map<string, ReleaseRelationship>>(new Map())
    const searchValueRef = useRef<HTMLInputElement>(null)
    const [loading, setLoading] = useState(false)
    const isExactMatch = useRef<boolean>(false)

    const handleSearch = async ({ searchValue }: { searchValue: string }) => {
        const session = await getSession()
        setLoading(true)
        try {
            if (CommonUtils.isNullOrUndefined(session)) {
                MessageService.error(t('Session has expired'))
                setLoading(false)
                return signOut()
            }
            const queryUrl = CommonUtils.createUrlWithParams('releases', {
                name: `${searchValue}`,
                luceneSearch: `${isExactMatch.current}`,
                allDetails: 'true',
            })
            const response = await ApiUtils.GET(queryUrl, session.user.access_token)
            if (response.status === HttpStatus.UNAUTHORIZED) {
                MessageService.error(t('Session has expired'))
                setLoading(false)
                return
            }

            if (response.status !== HttpStatus.OK) {
                MessageService.error(t('Error while processing'))
                return
            }
            const data = (await response.json()) as EmbeddedReleases

            const tableData =
                CommonUtils.isNullOrUndefined(data['_embedded']) &&
                CommonUtils.isNullOrUndefined(data['_embedded']['sw360:releases'])
                    ? []
                    : data['_embedded']['sw360:releases'].map((release: ReleaseDetail) => [
                          release.id ?? '',
                          release.vendor ? (release.vendor.fullName ?? '') : '',
                          {
                              name: release.name,
                              componentId: release['_links']['sw360:component']['href'].split('/').pop() ?? '',
                          },
                          {
                              releaseVersion: release.version,
                              releaseId: release.id ?? '',
                          },
                          release.clearingState,
                          release.mainlineState ?? 'OPEN',
                      ])
            setReleaseData(tableData)
            setLoading(false)
        } catch (e) {
            console.error(e)
        }
    }

    const projectPayloadSetter = (projectPayloadData: Map<string, ReleaseRelationship>) => {
        try {
            if (projectPayloadData.size > 0) {
                const updatedProjectPayload = { ...projectPayload }
                if (updatedProjectPayload.linkedReleases === undefined) {
                    updatedProjectPayload.linkedReleases = {}
                }
                for (const [releaseId, relationship] of projectPayloadData) {
                    updatedProjectPayload.linkedReleases[releaseId] = {
                        releaseRelation: relationship.releaseRelation,
                        mainlineState: relationship.mainlineState,
                        comment: relationship.comment,
                    }
                }
                setProjectPayload(updatedProjectPayload)
            }
        } catch (e) {
            console.error(e)
        }
    }

    const extractInterimReleaseData = (releaseId: string): ReleaseRelationship | undefined => {
        for (let i = 0; i < releaseData.length; i++) {
            if (releaseData[i][0] === releaseId) {
                return {
                    name: (releaseData[i][2] as SummaryReleaseInfo).name ?? '',
                    version: (releaseData[i][3] as SummaryReleaseInfo).releaseVersion,
                    mainlineState: releaseData[i][5] as string,
                    releaseRelation: 'UNKNOWN',
                    comment: '',
                }
            }
        }
        return undefined
    }

    const handleCheckboxes = (releaseId: string) => {
        const m = new Map(linkReleases)
        if (linkReleases.has(releaseId)) {
            m.delete(releaseId)
        } else {
            const interimData = extractInterimReleaseData(releaseId)
            if (interimData === undefined) return
            m.set(releaseId, interimData)
        }
        setLinkReleases(m)
    }

    const handleExactMatchChange = (event: ChangeEvent<HTMLInputElement>) => {
        const isExactMatchSelected = event.target.checked
        isExactMatch.current = isExactMatchSelected
    }

    const columns = [
        {
            id: 'linkReleases.selectReleaseCheckbox',
            name: '',
            width: '8%',
            formatter: (releaseId: string) =>
                _(
                    <div className='form-check'>
                        <input
                            className='form-check-input'
                            type='checkbox'
                            name='releaseId'
                            value={releaseId}
                            id={releaseId}
                            title=''
                            placeholder='Release Id'
                            checked={linkReleases.has(releaseId)}
                            onChange={() => handleCheckboxes(releaseId)}
                        />
                    </div>,
                ),
        },
        {
            id: 'linkReleases.vendor',
            name: t('Vendor'),
            sort: true,
        },
        {
            id: 'linkReleases.componentName',
            name: t('Component Name'),
            sort: true,
            formatter: ({ name, componentId }: { name: string; componentId: string }) =>
                _(
                    <>
                        <Link href={`/components/detail/${componentId}`}>{name}</Link>
                    </>,
                ),
        },
        {
            id: 'linkReleases.releaseVersion',
            name: t('Release version'),
            width: '15%',
            formatter: ({ releaseVersion, releaseId }: { releaseVersion: string; releaseId: string }) =>
                _(
                    <>
                        <Link href={`/components/releases/detail/${releaseId}`}>{releaseVersion}</Link>
                    </>,
                ),
            sort: true,
        },
        {
            id: 'linkReleases.clearingState',
            name: t('Clearing State'),
            sort: true,
        },
        {
            id: 'linkReleases.mainlineState',
            name: t('Mainline State'),
            sort: true,
        },
    ]
    const closeModal = () => {
        setShow(false)
        setReleaseData([])
        setLinkReleases(new Map())
        isExactMatch.current = false
    }

    return (
        <Modal
            size='lg'
            centered
            show={show}
            onHide={() => {
                closeModal()
            }}
            aria-labelledby={t('Link Releases')}
            scrollable
        >
            <Modal.Header closeButton>
                <Modal.Title id='linked-projects-modal'>{t('Link Releases')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Col>
                        <Row className='mb-3'>
                            <Col xs={6}>
                                <Form.Control
                                    type='text'
                                    placeholder={`${t('Enter Search Text')}...`}
                                    name='searchValue'
                                    ref={searchValueRef}
                                />
                            </Col>
                            <Col xs='auto'>
                                <Button
                                    type='submit'
                                    variant='secondary'
                                    onClick={() =>
                                        void handleSearch({ searchValue: searchValueRef.current?.value ?? '' })
                                    }
                                >
                                    {t('Search')}
                                </Button>
                            </Col>
                            <Col ls='auto'>
                                <Button
                                    type='submit'
                                    variant='secondary'
                                >
                                    {t(`Releases of linked projects`)}
                                </Button>
                            </Col>
                        </Row>
                        <Row>
                            <Form.Group controlId='exact-match-group'>
                                <Form.Check
                                    inline
                                    name='exact-match'
                                    type='checkbox'
                                    id='exact-match'
                                    onChange={handleExactMatchChange}
                                />
                                <Form.Label className='pt-2'>
                                    {t('Exact Match')}{' '}
                                    <sup>
                                        <FaInfoCircle />
                                    </sup>
                                </Form.Label>
                            </Form.Group>
                        </Row>
                        <Row>
                            {loading === false ? (
                                <Table
                                    columns={columns}
                                    data={releaseData}
                                    sort={false}
                                />
                            ) : (
                                <div
                                    className='col-12'
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Spinner className='spinner' />
                                </div>
                            )}
                        </Row>
                    </Col>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant='dark'
                    onClick={() => {
                        closeModal()
                    }}
                >
                    {t('Close')}
                </Button>
                <Button
                    variant='primary'
                    onClick={() => {
                        setShow(false)
                        setLinkedReleaseData((prevLinkReleases) => {
                            const newLinkReleases = new Map(prevLinkReleases)
                            linkReleases.forEach((value, key) => {
                                newLinkReleases.set(key, {
                                    name: value.name ?? '',
                                    version: value.version ?? '',
                                    releaseRelation: value.releaseRelation,
                                    mainlineState: value.mainlineState,
                                    comment: value.comment,
                                })
                            })
                            return newLinkReleases
                        })
                        projectPayloadSetter(linkReleases)
                    }}
                    disabled={linkReleases.size === 0}
                >
                    {t('Link Releases')}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}
