// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { type JSX } from 'react'
import { Button } from 'react-bootstrap'
import { BsPrinter } from 'react-icons/bs'
import { type ECCInterface } from '@/object-types'
import { CommonUtils } from '@/utils'

interface EccPrintHeaders {
    status: string
    releaseName: string
    eccn: string
    releaseVersion: string
    creatorGroup: string
    eccAssessor: string
    eccAssessorGroup: string
    eccAssessmentDate: string
}

interface EccPrintButtonProps {
    title: string
    rows: ECCInterface[]
    headers: EccPrintHeaders
    noRowsMessage: string
    label?: string
    variant?: string
    size?: 'sm' | 'lg'
    className?: string
}

const escapeHtml = (value: string): string =>
    value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')

const capitalizeEccStatus = (text: string): string =>
    text.split('_').reduce((s, c) => s + ' ' + (c.charAt(0) + c.substring(1).toLocaleLowerCase()), '')

const EccPrintButton = ({
    title,
    rows,
    headers,
    noRowsMessage,
    label = 'Print',
    variant = 'outline-secondary',
    size = 'sm',
    className = 'py-1 px-2',
}: EccPrintButtonProps): JSX.Element => {
    const onPrint = (): void => {
        const printWindow = window.open('', '_blank', 'width=1200,height=800')
        if (!printWindow) {
            return
        }

        const stylesheetMarkup = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
            .map((node) => node.outerHTML)
            .join('\n    ')

        const tableRows = rows
            .map((record) => {
                const status = capitalizeEccStatus(record.eccInformation?.eccStatus ?? '')
                const releaseName = `${record.name ?? ''} (${record.version ?? ''})`
                const eccn = record.eccInformation?.eccn ?? ''
                const releaseVersion = record.version ?? ''
                const creatorGroup = record.eccInformation?.creatorGroup ?? ''
                const eccAssessor = record.eccInformation?.assessorContactPerson ?? ''
                const eccAssessorGroup = record.eccInformation?.assessorDepartment ?? ''
                const assessmentDate = record.eccInformation?.assessmentDate ?? ''

                return `<tr>
                    <td>${escapeHtml(status)}</td>
                    <td>${escapeHtml(releaseName)}</td>
                    <td>${escapeHtml(eccn)}</td>
                    <td>${escapeHtml(releaseVersion)}</td>
                    <td>${escapeHtml(creatorGroup)}</td>
                    <td>${escapeHtml(eccAssessor)}</td>
                    <td>${escapeHtml(eccAssessorGroup)}</td>
                    <td>${escapeHtml(assessmentDate)}</td>
                </tr>`
            })
            .join('')

        const bodyContent =
            tableRows.length > 0
                ? `<table>
        <thead>
            <tr>
                <th>${escapeHtml(headers.status)}</th>
                <th>${escapeHtml(headers.releaseName)}</th>
                <th>${escapeHtml(headers.eccn)}</th>
                <th>${escapeHtml(headers.releaseVersion)}</th>
                <th>${escapeHtml(headers.creatorGroup)}</th>
                <th>${escapeHtml(headers.eccAssessor)}</th>
                <th>${escapeHtml(headers.eccAssessorGroup)}</th>
                <th>${escapeHtml(headers.eccAssessmentDate)}</th>
            </tr>
        </thead>
        <tbody>${tableRows}</tbody>
    </table>`
                : `<p>${escapeHtml(noRowsMessage)}</p>`

        printWindow.document.write(`<!doctype html>
<html>
<head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
    ${stylesheetMarkup}
</head>
<body class="ecc-print-page">
    <h1>${escapeHtml(title)}</h1>
    ${bodyContent}
</body>
</html>`)
        printWindow.document.close()
        printWindow.onload = () => {
            printWindow.focus()
            printWindow.print()
        }
    }

    return (
        <Button
            variant={variant}
            size={size}
            className={className}
            onClick={onPrint}
            title={label}
            aria-label='Print ECC table'
            disabled={CommonUtils.isNullEmptyOrUndefinedArray(rows)}
        >
            <BsPrinter className='me-1' />
            {label}
        </Button>
    )
}

export default EccPrintButton
