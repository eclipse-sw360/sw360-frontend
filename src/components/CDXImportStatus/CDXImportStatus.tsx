// Copyright (C) Siemens Healthineers, GmBH 2025. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import React, { JSX, useEffect } from 'react'
import { Alert, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { BsClipboard } from 'react-icons/bs'
import ImportSummary from '../../object-types/cyclonedx/ImportSummary'

interface Props {
    data: ImportSummary
    importTime?: number | null
    isNewProject?: boolean
}

const CDXImportStatus = ({ data, importTime, isNewProject }: Props): JSX.Element => {
    const t = useTranslations('default')
    const { status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [
        status,
    ])

    const Clipboard = ({ text }: { text: string }) => {
        return (
            <OverlayTrigger overlay={<Tooltip>{t('Copy to Clipboard')}</Tooltip>}>
                <span className='d-inline-block'>
                    <BsClipboard
                        onClick={() => {
                            void navigator.clipboard.writeText(text)
                        }}
                        style={{
                            cursor: 'pointer',
                        }}
                        size={20}
                    />
                </span>
            </OverlayTrigger>
        )
    }

    const renderCopyButton = (text: string) => (
        <button
            className='btn btn-light btn-sm position-absolute top-0 end-0 m-2'
            title='Copy to clipboard'
        >
            <Clipboard text={text} />
        </button>
    )

    const renderListAlert = (title: string, variant: string, items: string, emptyNote: string) => {
        const parts = items.split('||')
        return (
            <Alert
                variant={variant}
                className='border-warning-subtle p-3 position-relative'
            >
                {renderCopyButton(`${title}: ${parts.length}\n${parts.join('\n')}`)}
                <strong>{parts.length} </strong> {title} {emptyNote && `(${emptyNote})`}:
                <ul className='mb-0'>
                    {parts.map((comp, index) => (
                        <li key={index}>{comp}</li>
                    ))}
                </ul>
            </Alert>
        )
    }

    return (
        <>
            {isNewProject == true ? (
                <h5>
                    <strong>{t('SBOM imported successfully')}...</strong>
                </h5>
            ) : (
                <h5>
                    <strong>{t('SBOM Import Status')}...</strong>
                </h5>
            )}

            {isNewProject == true && data.projectId != null && (
                <Alert
                    variant='primary'
                    className='border-primary-subtle p-3'
                >
                    <p className='mb-1'>
                        {t('Created project with name')}:
                        <Link
                            href={`/projects/detail/${data.projectId}`}
                            passHref
                        >
                            <span className='fw-bold text-primary'>{data.projectName}</span>
                        </Link>
                        <br></br>
                        {importTime != null && (
                            <>
                                {t('Time taken for import')}: <strong>{importTime.toFixed(3)} Seconds</strong>
                            </>
                        )}
                    </p>
                </Alert>
            )}

            <Alert
                variant='success'
                className='p-3'
            >
                <ul className='list-unstyled'>
                    <li>
                        {t('Total Releases')}:
                        <strong>
                            <span className='text-success'>{+data.relCreationCount + +data.relReuseCount}</span>
                        </strong>
                        <ul>
                            <li>
                                {t('Releases created')}: <span className='text-success'>{data.relCreationCount}</span>
                            </li>
                            <li>
                                {t('Releases reused')}: <span className='text-success'>{data.relReuseCount}</span>
                            </li>
                        </ul>
                    </li>
                    <li>
                        {t('Total Packages')}:
                        <strong>
                            <span className='text-success'>{+data.pkgCreationCount + +data.pkgReuseCount}</span>
                        </strong>
                        <ul>
                            <li>
                                {t('Packages created')}: <span className='text-success'>{data.pkgCreationCount}</span>
                            </li>
                            <li>
                                {t('Packages reused')}: <span className='text-success'>{data.pkgReuseCount}</span>
                            </li>
                        </ul>
                    </li>
                </ul>
            </Alert>

            {data.invalidPkg != null &&
                data.invalidPkg.length > 0 &&
                renderListAlert(
                    t('List of invalid Packages without purl or name or version'),
                    'danger',
                    data.invalidPkg,
                    t('Not Imported'),
                )}

            {data.invalidComp != null &&
                data.invalidComp.length > 0 &&
                renderListAlert(
                    t('List of Packages with invalid or missing VCS information'),
                    'primary',
                    data.invalidComp,
                    t('Orphan Packages'),
                )}

            {data.dupPkg != null &&
                data.dupPkg.length > 0 &&
                renderListAlert(t('Packages were not imported'), 'warning', data.dupPkg, '')}

            {data.redirectedVCS != null &&
                data.redirectedVCS.length > 0 &&
                renderListAlert('VCS URLs were redirected', 'warning', data.redirectedVCS, '')}

            {data.dupComp != null &&
                data.dupComp.length > 0 &&
                renderListAlert(
                    t(
                        'Components were not imported because multiple duplicate components are found with the exact same name or vcs',
                    ),
                    'danger',
                    data.dupComp,
                    '',
                )}

            {data.dupRel != null &&
                data.dupRel.length > 0 &&
                renderListAlert(t('Releases were not imported'), 'danger', data.dupRel, '')}

            {data.invalidRel != null &&
                data.invalidRel.length > 0 &&
                renderListAlert(
                    t('Invalid releases with missing name or version'),
                    'danger',
                    data.invalidRel,
                    t('Not Imported'),
                )}
        </>
    )
}

export default CDXImportStatus
