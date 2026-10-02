// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { StatusCodes } from 'http-status-codes'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ReactNode, useMemo, useState } from 'react'
import { Button, Spinner } from 'react-bootstrap'
import { useConfigValue } from '@/contexts'

import { AdsInformation, AdsInformationRow, Attachment, AttachmentTypes, UIConfigKeys } from '@/object-types'
import ApiUtils from '@/utils/api/authenticatedApi.util'
import { dispatchSessionExpiredEvent } from '@/utils/sessionExpiry.utils'

interface Props {
    releaseId: string
    embeddedAttachments: Array<Attachment>
}

type AdsTabKey = 'licenseChanges' | 'copyrightChanges' | 'deletedFiles' | 'renamedFiles'

interface TabConfig {
    key: AdsTabKey
    title: string
    count: number
}

const formatCellValue = (value: unknown): string => {
    if (value === true) return 'yes'
    if (value === false || value === null || value === undefined) return '-'
    return String(value)
}

const formatColumnLabel = (key: string): string => {
    return key
        .replaceAll('_', ' ')
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b\w/g, (char) => char.toUpperCase())
}

const AssessmentSummaryInfo = ({ releaseId, embeddedAttachments }: Props): ReactNode => {
    const t = useTranslations('default')
    const showAdsInformation = useConfigValue(UIConfigKeys.UI_ENABLE_ADS_INFORMATION_DISPLAY) as boolean | null
    const [toggle, setToggle] = useState(false)
    const [activeTab, setActiveTab] = useState<AdsTabKey>('licenseChanges')
    const [searchTerm, setSearchTerm] = useState('')
    const [adsInformation, setAdsInformation] = useState<AdsInformation | null>(null)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const hasMultipleAdsAttachments = useMemo<boolean>(() => {
        const adsAttachments = embeddedAttachments.filter(
            (attachment) => attachment.attachmentType === AttachmentTypes.ADS_JSON,
        )

        return adsAttachments.length > 1
    }, [
        embeddedAttachments,
    ])

    const multipleAdsFilesMessage = 'Multiple ADS files are found in the release!'
    const displayErrorMessage = errorMessage ?? (hasMultipleAdsAttachments ? multipleAdsFilesMessage : null)

    const tabs = useMemo<Array<TabConfig>>(
        () => [
            {
                key: 'licenseChanges',
                title: 'Files with license changes',
                count: adsInformation?.clearingAssessment.licenseChangesCount ?? 0,
            },
            {
                key: 'copyrightChanges',
                title: 'Files with copyright changes',
                count: adsInformation?.clearingAssessment.copyrightChangesCount ?? 0,
            },
            {
                key: 'deletedFiles',
                title: 'Deleted Files',
                count: adsInformation?.clearingAssessment.deletedFilesCount ?? 0,
            },
            {
                key: 'renamedFiles',
                title: 'Renamed Files',
                count: adsInformation?.clearingAssessment.renamedFilesCount ?? 0,
            },
        ],
        [
            adsInformation,
        ],
    )

    const activeRows = useMemo<Array<AdsInformationRow>>(
        () => adsInformation?.[activeTab] ?? [],
        [
            adsInformation,
            activeTab,
        ],
    )

    const visibleColumns = useMemo<Array<string>>(() => {
        const columns: Array<string> = []
        activeRows.forEach((row) => {
            Object.keys(row).forEach((key) => {
                if (!columns.includes(key)) {
                    columns.push(key)
                }
            })
        })
        return columns
    }, [
        activeRows,
    ])

    const filteredRows = useMemo<Array<AdsInformationRow>>(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase()
        if (!normalizedSearch) {
            return activeRows
        }

        return activeRows.filter((row) => {
            return visibleColumns.some((column) => {
                const value = formatCellValue(row[column]).toLowerCase()
                return value.includes(normalizedSearch)
            })
        })
    }, [
        activeRows,
        searchTerm,
        visibleColumns,
    ])

    const getBackendErrorMessage = async (response: Response): Promise<string> => {
        const fallbackMessage = t('Failed to load ADS Information')
        const responseText = await response.text()

        if (responseText.trim() === '') {
            return fallbackMessage
        }

        try {
            const parsedError = JSON.parse(responseText) as unknown

            if (typeof parsedError === 'string') {
                return parsedError
            }

            if (
                parsedError !== null &&
                typeof parsedError === 'object' &&
                'message' in parsedError &&
                typeof parsedError.message === 'string'
            ) {
                return parsedError.message
            }
        } catch {
            return responseText
        }

        return responseText
    }

    const handleShowAdsInformation = async () => {
        if (hasMultipleAdsAttachments) {
            setErrorMessage(multipleAdsFilesMessage)
            return
        }

        if (adsInformation !== null) {
            return
        }

        setIsLoading(true)
        setErrorMessage(null)
        setAdsInformation(null)

        try {
            const response = await ApiUtils.GET(`releases/${releaseId}/adsInformation`)
            if (response.status === StatusCodes.OK) {
                const data = (await response.json()) as AdsInformation
                setAdsInformation(data)
                return
            }

            if (response.status === StatusCodes.UNAUTHORIZED) {
                dispatchSessionExpiredEvent()
                return
            }

            setErrorMessage(await getBackendErrorMessage(response))
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : t('Failed to load ADS Information'))
        } finally {
            setIsLoading(false)
        }
    }

    const renderSummaryRow = (
        label: string,
        value: string,
        options?: {
            href?: string
            badge?: boolean
            tabKey?: AdsTabKey
        },
    ): ReactNode => {
        return (
            <tr key={label}>
                <td>{t(label as never)}</td>
                <td className='text-end'>
                    {options?.href ? (
                        <Link href={options.href}>{value}</Link>
                    ) : options?.badge && options.tabKey ? (
                        <button
                            type='button'
                            className='ads-info-count-badge ads-info-count-badge--nav'
                            onClick={() => {
                                setActiveTab(options.tabKey!)
                                setSearchTerm('')
                            }}
                        >
                            {value}
                        </button>
                    ) : options?.badge ? (
                        <span className='ads-info-count-badge'>{value}</span>
                    ) : (
                        value
                    )}
                </td>
            </tr>
        )
    }

    if (showAdsInformation !== null && !showAdsInformation) {
        return <></>
    }

    return (
        <div className='summary-table ads-info-section'>
            <div
                className='ads-info-header'
                title='Click to expand or collapse'
                onClick={() => {
                    const shouldExpand = toggle
                    setToggle(!toggle)
                    if (shouldExpand) {
                        void handleShowAdsInformation()
                    }
                }}
            >
                {t('ADS Information')}:
            </div>
            {!toggle && (
                <div className='ads-info-body'>
                    {!isLoading && adsInformation === null && displayErrorMessage === null && (
                        <Button
                            variant='secondary'
                            onClick={() => void handleShowAdsInformation()}
                        >
                            {t('Show ADS Information')}
                        </Button>
                    )}

                    {isLoading && (
                        <div className='ads-info-loading'>
                            <Spinner
                                animation='border'
                                role='status'
                                size='sm'
                                className='me-2'
                            />
                            {t('Loading ADS Information')}
                        </div>
                    )}

                    {!isLoading && displayErrorMessage !== null && <div className='mt-2'>{displayErrorMessage}</div>}

                    {!isLoading && adsInformation !== null && (
                        <>
                            <div className='row ads-info-cards-row g-3'>
                                <div className='col-12 col-lg-4'>
                                    <div className='ads-info-card'>
                                        <h6 className='ads-info-card-title'>{t('Candidate Release')}</h6>
                                        <table className='table table-sm mb-0'>
                                            <tbody>
                                                {renderSummaryRow(
                                                    'Release Name',
                                                    adsInformation.candidateRelease.releaseName,
                                                )}
                                                {renderSummaryRow('Version', adsInformation.candidateRelease.version)}
                                                {renderSummaryRow(
                                                    'Release ID',
                                                    adsInformation.candidateRelease.releaseId,
                                                    {
                                                        href: `/components/detail/${adsInformation.candidateRelease.releaseId}`,
                                                    },
                                                )}
                                                {renderSummaryRow(
                                                    'Changed Files',
                                                    String(adsInformation.candidateRelease.changedFilesCount),
                                                    {
                                                        badge: true,
                                                    },
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className='col-12 col-lg-4'>
                                    <div className='ads-info-card'>
                                        <h6 className='ads-info-card-title'>{t('Base Release')}</h6>
                                        <table className='table table-sm mb-0'>
                                            <tbody>
                                                {renderSummaryRow(
                                                    'Release Name',
                                                    adsInformation.baseRelease.releaseName,
                                                )}
                                                {renderSummaryRow('Version', adsInformation.baseRelease.version)}
                                                {renderSummaryRow('Release ID', adsInformation.baseRelease.releaseId, {
                                                    href: `/components/detail/${adsInformation.baseRelease.releaseId}`,
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className='col-12 col-lg-4'>
                                    <div className='ads-info-card'>
                                        <h6 className='ads-info-card-title'>{t('Clearing Assessment')}</h6>
                                        <table className='table table-sm mb-0'>
                                            <tbody>
                                                {renderSummaryRow(
                                                    'Clearing Required',
                                                    formatCellValue(adsInformation.clearingAssessment.clearingRequired),
                                                )}
                                                {renderSummaryRow(
                                                    'Files with license changes',
                                                    String(adsInformation.clearingAssessment.licenseChangesCount),
                                                    {
                                                        badge: true,
                                                        tabKey: 'licenseChanges',
                                                    },
                                                )}
                                                {renderSummaryRow(
                                                    'Files with copyright changes',
                                                    String(adsInformation.clearingAssessment.copyrightChangesCount),
                                                    {
                                                        badge: true,
                                                        tabKey: 'copyrightChanges',
                                                    },
                                                )}
                                                {renderSummaryRow(
                                                    'Deleted Files',
                                                    String(adsInformation.clearingAssessment.deletedFilesCount),
                                                    {
                                                        badge: true,
                                                        tabKey: 'deletedFiles',
                                                    },
                                                )}
                                                {renderSummaryRow(
                                                    'Renamed Files',
                                                    String(adsInformation.clearingAssessment.renamedFilesCount),
                                                    {
                                                        badge: true,
                                                        tabKey: 'renamedFiles',
                                                    },
                                                )}
                                                {renderSummaryRow(
                                                    'CLX Auto Update Required',
                                                    formatCellValue(
                                                        adsInformation.clearingAssessment.clxAutoUpdateRequired,
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            <ul className='nav nav-tabs mt-3 ads-info-tabs'>
                                {tabs.map((tab) => (
                                    <li
                                        className='nav-item'
                                        key={tab.key}
                                    >
                                        <button
                                            type='button'
                                            className={`nav-link ${activeTab === tab.key ? 'active' : ''}`}
                                            onClick={() => {
                                                setActiveTab(tab.key)
                                                setSearchTerm('')
                                            }}
                                        >
                                            {`${t(tab.title as never)} (${tab.count})`}
                                        </button>
                                    </li>
                                ))}
                            </ul>

                            <div className='mt-2'>
                                <input
                                    className='form-control ads-info-search-input'
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                    placeholder={`${t('Search')}...`}
                                />
                            </div>

                            <div className='ads-info-table-wrapper mt-2'>
                                <table className='table table-bordered table-hover'>
                                    <thead>
                                        <tr>
                                            {visibleColumns.map((column) => {
                                                const formattedColumnLabel = formatColumnLabel(column)
                                                const headerLabel =
                                                    formattedColumnLabel.toLowerCase() === 'value'
                                                        ? t('File')
                                                        : formattedColumnLabel

                                                return <th key={column}>{headerLabel}</th>
                                            })}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredRows.length > 0 ? (
                                            filteredRows.map((row, index) => (
                                                <tr key={`${activeTab}-${index}`}>
                                                    {visibleColumns.map((column) => (
                                                        <td key={`${activeTab}-${index}-${column}`}>
                                                            {formatCellValue(row[column])}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={Math.max(visibleColumns.length, 1)}
                                                    className='text-center'
                                                >
                                                    {t('No data available in table')}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

export default AssessmentSummaryInfo
