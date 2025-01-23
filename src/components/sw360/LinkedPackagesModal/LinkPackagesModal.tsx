// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { Embedded,
         HttpStatus,
         LinkedPackageData,
         Package,
         ProjectPayload } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'
import { getSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Table, _ } from 'next-sw360'
import Link from 'next/link'
import { ChangeEvent, useRef, useState } from 'react'
import { Button, Col, Form, Modal, Row } from 'react-bootstrap'
import { FaInfoCircle } from 'react-icons/fa'


interface Props {
    setLinkedPackageData: React.Dispatch<React.SetStateAction<Map<string, LinkedPackageData>>>
    projectPayload: ProjectPayload
    setProjectPayload: React.Dispatch<React.SetStateAction<ProjectPayload>>
    show: boolean
    setShow: (show: boolean) => void
}

type EmbeddedPackages = Embedded<Package, 'sw360:packages'>

type RowData = (string | string[] | string[][] | undefined)[]

export default function LinkPackagesModal({
    setLinkedPackageData,
    projectPayload,
    setProjectPayload,
    show,
    setShow,
}: Props): JSX.Element {
    const t = useTranslations('default')
    const [packageData, setPackageData] = useState<RowData[]>([])
    const [linkPackages, setLinkPackages] = useState<Map<string, LinkedPackageData>>(new Map())
    const searchValueRef = useRef<HTMLInputElement>(null)
    const topRef = useRef(null)
    const isExactMatch = useRef<boolean>(false)

    const columns = [
        {
            id: 'linkPackages.selectPackageCheckbox',
            name: '',
            width: '8%',
            formatter: (packageId: string) =>
                _(
                    <div className='form-check'>
                        <input
                            className='form-check-input'
                            type='checkbox'
                            name='packageId'
                            value={packageId}
                            id={packageId}
                            title=''
                            placeholder='Package Id'
                            checked={linkPackages.has(packageId)}
                            onChange={() => handleCheckboxes(packageId)}
                        />
                    </div>,
                ),
        },
        {
            id: 'linkPackages.name',
            name: t('Name'),
            width: 'auto',
            sort: true,
            formatter: ([ name, packageId ]: [ string, string ]) =>
                _(
                    <>
                        <Link href={`/packages/detail/${packageId}`}>{name}</Link>
                    </>
                ),
        },
        {
            id: 'linkPackages.version',
            name: t('Version'),
            width: 'auto',
            sort: true,
        },
        {
            id: 'linkPackages.license',
            name: t('License'),
            width: 'auto',
            sort: true,
            formatter: (licenseIds: string[]) => _(
                <div>
                    {licenseIds.map((lincenseId, index) => (
                        <span key={index}>
                            <Link href={`/licenses/detail?id=${lincenseId}`}>
                                {lincenseId}
                            </Link>
                            {index !== licenseIds.length - 1 && ', '}
                        </span>
                    ))}
                </div>
            )
        },
        {
            id: 'linkPackages.packageManager',
            name: t('Package Manager'),
            width: 'auto',
            sort: true,
        },
        {
            id: 'linkPackages.purl',
            name: t('Purl'),
            width: 'auto',
            sort: true,
        },
    ]

    const extractInterimPackageData = (packageId: string) => {
        for (let i = 0; i < packageData.length; i++) {
            if (packageData[i][0] === packageId) {
                return {
                    packageId: packageData[i][0] as string,
                    name: packageData[i][1]?.[0] as string,
                    version: packageData[i][2] as string,
                    licenseIds: packageData[i][3] as string[],
                    packageManager: packageData[i][4] as string,
                }
            }
        }
        return undefined
    }

    const handleExactMatchChange = (event: ChangeEvent<HTMLInputElement>) => {
        const isExactMatchSelected = event.target.checked
        isExactMatch.current = isExactMatchSelected
    }

    const handleSearch = async ({ searchValue }: { searchValue: string }) => {
        try {
            const queryUrl = CommonUtils.createUrlWithParams('packages', {
                name: `${searchValue}`,
                luceneSearch: `${isExactMatch.current}`,
            })
            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session)) {
                MessageService.error(t('Session has expired'))
                return signOut()
            }
            const response = await ApiUtils.GET(queryUrl, session.user.access_token)
            if (response.status == HttpStatus.OK) {
                const data = (await response.json()) as EmbeddedPackages
                const dataTableFormat =
                    CommonUtils.isNullOrUndefined(data['_embedded']) &&
                    CommonUtils.isNullOrUndefined(data['_embedded']['sw360:packages'])
                        ? []
                        : data['_embedded']['sw360:packages'].map((singlePackage: Package) => [
                            CommonUtils.getIdFromUrl(singlePackage._links?.self.href),
                            [
                                singlePackage.name ?? '',
                                CommonUtils.getIdFromUrl(singlePackage._links?.self.href)
                            ],
                            singlePackage.version ?? '',
                            singlePackage.licenseIds ?? [''],
                            singlePackage.packageManager ?? '',
                            singlePackage.purl ?? '',
                        ])
                setPackageData(dataTableFormat)
            }
            else if (response.status == HttpStatus.FORBIDDEN) {
                MessageService.warn(t('Access Denied'))
            }
            else if (response.status == HttpStatus.INTERNAL_SERVER_ERROR) {
                MessageService.error(t('Internal server error'))
            }
            else if (response.status == HttpStatus.UNAUTHORIZED) {
                MessageService.error(t('Unauthorized request'))
            }
        } catch (e) {
            console.error(e)
        }
    }

    const projectPayloadSetter = (linkedPackagePayloadData: Map<string, LinkedPackageData>) => {
        try {
            if (linkedPackagePayloadData.size > 0) {
                const updatedProjectPayload = { ...projectPayload }
                if (updatedProjectPayload.packageIds === undefined) {
                    updatedProjectPayload.packageIds = []
                }
                else {
                    for (const [packageId, ] of linkedPackagePayloadData) {
                        if (!updatedProjectPayload.packageIds.includes(packageId))
                            updatedProjectPayload.packageIds.push(packageId)
                        }
                    }
                setProjectPayload(updatedProjectPayload)
            }
        }
        catch (e) {
            console.error(e)
        }
    }

    const handleCheckboxes = (packageId: string) => {
        const m = new Map(linkPackages)
        if (linkPackages.has(packageId)) {
            m.delete(packageId)
        } else {
            const interimData = extractInterimPackageData(packageId)
            if (interimData === undefined) return
            m.set(packageId, interimData)
        }
        setLinkPackages(m)
    }

    const closeModal = () => {
        setShow(false)
        setPackageData([])
        setLinkPackages(new Map())
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
            aria-labelledby={t('Link Packages')}
            scrollable
        >
            <Modal.Header closeButton>
                <Modal.Title id='linked-projects-modal'>{t('Link Packages')}</Modal.Title>
            </Modal.Header>
            <Modal.Body ref={topRef}>
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
                            </Col>
                            <Col xs='auto'>
                                <Button
                                    variant='secondary'
                                    onClick={() =>
                                        void handleSearch({ searchValue: searchValueRef.current?.value ?? '' })
                                    }
                                >
                                    {t('Search')}
                                </Button>
                            </Col>
                        </Row>
                        <Row>
                            <Table
                                columns={columns}
                                data={packageData}
                                sort={false}
                            />
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
                        setLinkedPackageData(linkPackages)
                        setShow(false)
                        projectPayloadSetter(linkPackages)
                    }}
                    disabled={linkPackages.size === 0}
                >
                    {t('Link Packages')}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}
