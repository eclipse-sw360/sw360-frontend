// Copyright Siemens AG, 2026. Part of the SW360 Frontend Project.
//
// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/
//
// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { type JSX, useCallback, useEffect, useState } from 'react'
import { Alert, Spinner } from 'react-bootstrap'
import ApiUtils from '@/utils/api/authenticatedApi.util'

function ReportDownloadPage(): JSX.Element {
    const t = useTranslations('default')
    const searchParams = useSearchParams()
    const [error, setError] = useState<string | null>(null)
    const [downloading, setDownloading] = useState(false)
    const [downloaded, setDownloaded] = useState(false)

    const module = searchParams.get('module') ?? ''
    const token = searchParams.get('token') ?? ''
    const extendedByReleases = searchParams.get('extendedByReleases') ?? 'false'
    const projectId = searchParams.get('projectId') ?? ''
    const generatorClassName = searchParams.get('generatorClassName') ?? ''
    const variant = searchParams.get('variant') ?? ''

    const triggerDownload = useCallback(async () => {
        if (!module || !token) {
            setError(t('Missing required parameters (module, token)'))
            return
        }

        setDownloading(true)
        setError(null)

        try {
            let url = `reports/download?module=${encodeURIComponent(module)}&token=${encodeURIComponent(token)}&extendedByReleases=${extendedByReleases}`
            if (projectId) {
                url += `&projectId=${encodeURIComponent(projectId)}`
            }
            if (generatorClassName) {
                url += `&generatorClassName=${encodeURIComponent(generatorClassName)}`
            }
            if (variant) {
                url += `&variant=${encodeURIComponent(variant)}`
            }

            const response = await ApiUtils.GET(url)

            if (!response.ok) {
                setError(
                    `${t('Download failed with status')} ${response.status}. ${t('Please try again or contact support')}`,
                )
                return
            }

            // Extract filename from Content-Disposition header, fall back to default
            const disposition = response.headers.get('Content-Disposition')
            let fileName = `${module}-report.xlsx`
            if (disposition) {
                const match = disposition.match(/filename="?([^"]+)"?/)
                if (match) {
                    fileName = match[1]
                }
            }

            const blob = await response.blob()
            const objectURL = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = objectURL
            link.setAttribute('download', fileName)
            link.click()
            setTimeout(() => window.URL.revokeObjectURL(objectURL), 0)
            setDownloaded(true)
        } catch {
            setError(t('An error occurred while downloading the report'))
        } finally {
            setDownloading(false)
        }
    }, [
        module,
        token,
        extendedByReleases,
        projectId,
    ])

    useEffect(() => {
        if (!downloaded && !downloading) {
            void triggerDownload()
        }
    }, [
        downloaded,
        downloading,
        triggerDownload,
    ])

    return (
        <div className='container mt-5'>
            <h3>{t('Report Download')}</h3>
            {downloading && (
                <div className='text-center mt-4'>
                    <Spinner animation='border' />
                    <p className='mt-2'>{t('Downloading report')}</p>
                </div>
            )}
            {error && (
                <Alert
                    variant='danger'
                    className='mt-3'
                >
                    {error}
                </Alert>
            )}
            {downloaded && (
                <Alert
                    variant='success'
                    className='mt-3'
                >
                    {t('Report downloaded successfully')}
                </Alert>
            )}
        </div>
    )
}

export default ReportDownloadPage
