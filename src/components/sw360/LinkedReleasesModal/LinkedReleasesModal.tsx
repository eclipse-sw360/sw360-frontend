// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

"use client"

import { HttpStatus, ProjectPayload } from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Table, _ } from 'next-sw360'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { useRef, useState } from 'react'
import { Button, Col, Form, Modal, Row, Spinner } from 'react-bootstrap'
import { FaInfoCircle } from 'react-icons/fa'


interface Props {
    setLinkedReleaseData: React.Dispatch<React.SetStateAction<Map<string, any>>>
    projectPayload: ProjectPayload
    setProjectPayload: React.Dispatch<React.SetStateAction<ProjectPayload>>
    show: boolean
    setShow: (show: boolean) => void
}


export default function LinkedReleasesModal({ setLinkedReleaseData,
                                              projectPayload,
                                              setProjectPayload,
                                              show,
                                              setShow }: Props) {

    const t = useTranslations('default')
    const [releaseData, setReleaseData] = useState<any[] | null>(null)
    const [linkReleases, setLinkReleases] = useState<Map<string, any>>(new Map())
    const searchValueRef = useRef<HTMLInputElement>(null)
    const { data: session, status } = useSession()
    const [loading, setLoading] = useState(false)

    const handleSearch = async ({ searchValue }: { searchValue: string }): Promise<any> => {
        setLoading(true)
        try {
            const queryUrl = CommonUtils.createUrlWithParams('releases', {
                name: `${searchValue}`,
                luceneSearch: 'true',
                allDetails: 'true'
            })
            const response = await ApiUtils.GET(queryUrl, session.user.access_token)
            if (response.status !== HttpStatus.OK) {
                return notFound()
            }
            const data = await response.json()

            const tableData =
                CommonUtils.isNullOrUndefined(data['_embedded']) &&
                CommonUtils.isNullOrUndefined(data['_embedded']['sw360:releases'])
                    ? []
                    : data['_embedded']['sw360:releases'].map((elem: any) => [
                          elem.id,
                          elem.vendorName ? elem.vendorName : '',
                          {
                            name : elem.name,
                            componentId : elem['_links']['sw360:component']['href'].split('/').pop()
                          },
                          {
                            releaseVersion : elem.version,
                            releaseId : elem.id
                          },
                          elem.clearingState,
                          elem.mainlineState
                      ])
            setReleaseData(tableData)
            setLoading(false)
        } catch (e) {
            console.error(e)
        }
    }

    const projectPayloadSetter = (projectPayloadData: Map<string, any>) => {
        try {
            if (projectPayloadData.size > 0) {
                projectPayloadData.forEach((value, key) => {
                    const releaseId = key
                    const updatedProjectPayload = { ...projectPayload }
                    updatedProjectPayload.linkedReleases[releaseId] = {
                        releaseRelation: value.releaseRelation,
                        mainlineState: value.mainlineState,
                        comment: ''
                    }
                    setProjectPayload(updatedProjectPayload)
                })
            }
        } catch (e) {
            console.error(e)
        }
    }

    const extractInterimReleaseData = (releaseId: string) => {
        const interimReleaseData = []
        for (let i = 0; i < releaseData.length; i++) {
            if (releaseData[i][0] === releaseId) {
                interimReleaseData.push(releaseData[i][2]['name'],
                                        releaseData[i][3]['releaseVersion'],
                                        releaseData[i][5])
                return interimReleaseData
            }
        }
    }

    const handleCheckboxes = (releaseId: string) => {
        const m = new Map(linkReleases)
        if (linkReleases.has(releaseId)) {
            m.delete(releaseId)
        } else {
            const interimData = extractInterimReleaseData(releaseId)
            m.set(releaseId, {
                name: interimData[0],
                version: interimData[1],
                releaseRelation: 'UNKNOWN',
                mainlineState: interimData[2],
                comment: ''
            })
        }
        setLinkReleases(m)
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
                    </div>
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
                        <Link href={`/components/detail/${componentId}`}>
                               {name}
                        </Link>
                    </>
                ),
        },
        {
            id: 'linkReleases.releaseVersion',
            name: t('Release version'),
            width: '15%',
            formatter: ({ releaseVersion, releaseId }: { releaseVersion: string; releaseId: string }) =>
                _(
                    <>
                         <Link href={`/components/releases/detail/${releaseId}`}>
                               {releaseVersion}
                        </Link>
                    </>
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

    if (status === 'unauthenticated') {
        signOut()
    } else {
    return (
        <>
            <Modal
                size="lg"
                centered
                show={show}
                onHide={() => {
                    setShow(false)
                    setReleaseData(null)
                    setLinkReleases(new Map())

                }}
                aria-labelledby={t('Link Releases')}
                scrollable
            >
                <Modal.Header closeButton>
                    <Modal.Title id="linked-projects-modal">
                        {t('Link Releases')}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Col>
                            <Row className="mb-3">
                                <Col xs={6}>
                                    <Form.Control
                                        type="text"
                                        placeholder={`${t('Enter Search Text')}...`}
                                        name='searchValue'
                                        ref={searchValueRef}
                                    />
                                </Col>
                                <Col xs='auto'>
                                    <Button
                                        type="submit"
                                        variant="secondary"
                                        onClick={async () => {
                                            await handleSearch({ searchValue: searchValueRef.current.value })
                                        }}
                                    >
                                        {t('Search')}
                                    </Button>
                                </Col>
                                <Col ls='auto'>
                                    <Button type="submit"
                                            variant="secondary"
                                    >
                                        {t(`Releases of linked projects`)}
                                    </Button>
                                </Col>
                            </Row>
                            <Row>
                                <Form.Group controlId="exact-match-group">
                                    <Form.Check
                                            inline
                                            name="exact-match"
                                            type="checkbox"
                                            id="exact-match"
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
                                {
                                    loading == false ? ( releaseData &&
                                        <Table
                                            columns={columns}
                                            data={releaseData}
                                            sort={false}/>
                                        ) : (
                                                <div className='col-12'
                                                     style={{
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        alignItems: 'center'}}
                                                >
                                                    <Spinner className='spinner' />
                                                </div>
                                        )
                                }
                            </Row>
                        </Col>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="dark"
                        onClick={() => {
                            setShow(false)
                            setReleaseData(null)
                            setLinkReleases(new Map())
                        }}
                    >
                        {t('Close')}
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => {
                            setShow(false)
                            setLinkedReleaseData((prevLinkReleases) =>
                                new Map([...prevLinkReleases, ...linkReleases]))
                            projectPayloadSetter(linkReleases)
                        }}
                        disabled={linkReleases.size === 0}
                    >
                        {t('Link Releases')}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )}
}
