// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { AccessControl } from '@/components/AccessControl/AccessControl'
import { Embedded, Package, UserGroupType } from '@/object-types'
import { CommonUtils } from '@/utils'
import { SW360_API_URL } from '@/utils/env'
import { ServerStorageOptions } from 'gridjs/dist/src/storage/server'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { AdvancedSearch, Table, _ } from 'next-sw360'
import Link from 'next/link'
import { redirect, useRouter, useSearchParams } from 'next/navigation'
import { ReactNode, useEffect, useState } from 'react'
import { OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap'
import { FaPencilAlt, FaTrashAlt } from 'react-icons/fa'
import DeletePackageModal from './DeletePackageModal'
import { packageManagers } from './PackageManagers'

type EmbeddedPackages = Embedded<Package, 'sw360:packages'>

interface DeletePackageModalMetData {
    show: boolean
    packageId: string
    packageName: string
    packageVersion: string
}

function Packages(): ReactNode {
    const { data: session, status } = useSession()
    const t = useTranslations('default')
    const params = useSearchParams()
    const router = useRouter()
    const [deletePackageModalMetaData, setDeletePackageModalMetaData] = useState<DeletePackageModalMetData>({
        show: false,
        packageId: '',
        packageName: '',
        packageVersion: '',
    })

    const handleCreatePackage = () => {
        router.push('/packages/add')
    }

    useEffect(() => {
        if (status === 'unauthenticated') {
            redirect('/')
        }
    }, [status])

    const columns = [
        {
            id: 'packages.name',
            name: `${t('Package Name')} (${t('Version')})`,
            formatter: ({ id, name, version }: { id: string; name: string; version: string }) =>
                _(
                    <>
                        <Link
                            href={`/packages/detail/${id}`}
                            className='text-link'
                        >
                            {name} {version !== '' && `(${version})`}
                        </Link>
                    </>,
                ),
            sort: true,
        },
        {
            id: 'packages.releaseName',
            name: `${t('Release Name')} (${t('Version')})`,
            sort: true,
        },
        {
            id: 'packages.releaseClearingState',
            name: t('Release Clearing State'),
            sort: true,
        },
        {
            id: 'packages.licenses',
            name: t('Licenses'),
            width: '8%',
            sort: true,
        },
        {
            id: 'packages.packageManager',
            name: t('Package Manager'),
            sort: true,
        },
        {
            id: 'packages.actions',
            name: t('Actions'),
            width: '13%',
            formatter: ({ id, name, version }: { id: string; name: string; version: string }) =>
                _(
                    <span className='d-flex justify-content-evenly'>
                        <OverlayTrigger overlay={<Tooltip>{t('Edit')}</Tooltip>}>
                            <Link
                                href={`/packages/edit/${id}`}
                                className='overlay-trigger'
                            >
                                <FaPencilAlt className='btn-icon' />
                            </Link>
                        </OverlayTrigger>
                        <OverlayTrigger overlay={<Tooltip>{t('Delete')}</Tooltip>}>
                            <span className='d-inline-block'>
                                <FaTrashAlt
                                    className='btn-icon'
                                    onClick={() =>
                                        setDeletePackageModalMetaData({
                                            show: true,
                                            packageId: id,
                                            packageName: name,
                                            packageVersion: version,
                                        })
                                    }
                                    style={{ color: 'gray', fontSize: '18px' }}
                                />
                            </span>
                        </OverlayTrigger>
                    </span>,
                ),
            sort: true,
        },
    ]

    const initServerPaginationConfig = () => {
        if (CommonUtils.isNullOrUndefined(session)) return signOut()
        return {
            url: CommonUtils.createUrlWithParams(`${SW360_API_URL}/resource/api/packages`, Object.fromEntries(params)),
            then: (data: EmbeddedPackages) => {
                return data._embedded['sw360:packages'].map((elem: Package) => [
                    {
                        id: elem._links?.self.href.split('/').at(-1) ?? '',
                        name: elem.name ?? '',
                        version: elem.version ?? '',
                    },
                    '',
                    '',
                    '',
                    elem.packageManager ?? '',
                    {
                        id: elem._links?.self.href.split('/').at(-1) ?? '',
                        name: elem.name ?? '',
                        version: elem.version ?? '',
                    },
                ])
            },
            total: (data: EmbeddedPackages) => data.page?.totalElements,
            headers: { Authorization: `${session.user.access_token}` },
        }
    }

    const advancedSearch = [
        {
            fieldName: t('Package Name'),
            value: '',
            paramName: 'name',
        },
        {
            fieldName: t('Package Version'),
            value: '',
            paramName: 'version',
        },
        {
            fieldName: t('Package Manager'),
            value: packageManagers.map((p) => ({ key: p, text: p })),
            paramName: 'packageManager',
        },
        {
            fieldName: t('Licenses'),
            value: '',
            paramName: 'licenses',
        },
        {
            fieldName: t('purl'),
            value: '',
            paramName: 'purl',
        },
        {
            fieldName: `${t('Created By')} (${t('Email')})`,
            value: '',
            paramName: 'createdBy',
        },
        {
            fieldName: t('Created On'),
            value: [
                {
                    key: 'EQUAL',
                    text: '=',
                },
                {
                    key: 'LESS_THAN_OR_EQUAL_TO',
                    text: '<=',
                },
                {
                    key: 'GREATER_THAN_OR_EQUAL_TO',
                    text: '>=',
                },
                {
                    key: 'BETWEEN',
                    text: t('Between'),
                },
            ],
            paramName: 'createdOn',
        },
    ]

    if (status === 'unauthenticated') {
        return signOut()
    } else {
        return (
            <>
                <DeletePackageModal
                    modalMetaData={deletePackageModalMetaData}
                    setModalMetaData={setDeletePackageModalMetaData}
                    isEditPage={false}
                />
                <div className='container page-content'>
                    <div className='row'>
                        <div className='col-2'>
                            <AdvancedSearch
                                title='Advanced Search'
                                fields={advancedSearch}
                            />
                        </div>
                        <div className='col-10'>
                            <div className='row'>
                                <div className='col d-flex justify-content-between'>
                                    <button
                                        className='btn btn-primary col-auto'
                                        onClick={handleCreatePackage}
                                    >
                                        {t('Add Package')}
                                    </button>
                                    <div className='col-auto buttonheader-title'>{t('PACKAGES')}</div>
                                </div>
                            </div>
                            {status === 'authenticated' ? (
                                <Table
                                    columns={columns}
                                    server={initServerPaginationConfig() as ServerStorageOptions}
                                    selector={true}
                                    sort={false}
                                />
                            ) : (
                                <div className='col-12 d-flex justify-content-center align-items-center'>
                                    <Spinner className='spinner' />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </>
        )
    }
}

// Pass notAllowedUserGroups to AccessControl to restrict access
export default AccessControl(Packages, [UserGroupType.SECURITY_USER])
