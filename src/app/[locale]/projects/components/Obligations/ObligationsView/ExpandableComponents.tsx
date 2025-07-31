// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { LicenseObligationRelease } from '@/object-types'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { JSX, useEffect, useState } from 'react'
import { BsCaretDownFill, BsCaretRightFill } from 'react-icons/bs'

export function ShowObligationTextOnExpand({
    id,
    infoText,
    colLength,
}: {
    id: string
    infoText: string
    colLength: number
}): JSX.Element {
    const [isExpanded, setIsExpanded] = useState(false)
    const { status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [status])

    useEffect(() => {
        if (isExpanded) {
            const el = document.getElementById(id)
            const par = el?.parentElement?.parentElement?.parentElement
            const tr = document.createElement('tr')
            tr.id = `${id}_text`
            const td = document.createElement('td')
            td.colSpan = colLength
            const licenseObligationText = document.createElement('p')
            licenseObligationText.style.whiteSpace = 'pre-line'
            licenseObligationText.textContent = infoText
            licenseObligationText.className = 'ps-5 pt-2 pe-3'
            td.appendChild(licenseObligationText)
            tr.appendChild(td)
            par?.parentNode?.insertBefore(tr, par.nextSibling)
        } else {
            const el = document.getElementById(`${id}_text`)
            if (el) {
                el.remove()
            }
        }
    }, [isExpanded])

    return (
        <>
            {isExpanded ? (
                <BsCaretDownFill
                    color='gray'
                    id={id}
                    onClick={() => setIsExpanded(!isExpanded)}
                />
            ) : (
                <BsCaretRightFill
                    color='gray'
                    id={id}
                    onClick={() => setIsExpanded(!isExpanded)}
                />
            )}
        </>
    )
}

export function ExpandableList({
    previewString,
    releases,
    commonReleases,
}: {
    previewString: string
    releases: LicenseObligationRelease[]
    commonReleases: LicenseObligationRelease[]
}): JSX.Element {
    const [isExpanded, setExpanded] = useState(false)
    const { status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [status])
    return (
        <>
            {isExpanded ? (
                <div>
                    <span>
                        <BsCaretDownFill onClick={() => setExpanded(false)} />{' '}
                    </span>
                    {releases.map((release: LicenseObligationRelease, index: number) => {
                        const isCommon = commonReleases.some(
                            (commonRelease: LicenseObligationRelease) =>
                                commonRelease.name === release.name && commonRelease.version === release.version,
                        )
                        return (
                            <li
                                key={release.id}
                                style={{ display: 'inline' }}
                            >
                                <Link
                                    href={`/components/releases/detail/${release.id}`}
                                    className='text-link'
                                    style={{ color: isCommon ? 'green' : 'neon carrot' }}
                                >
                                    {`${release.name} ${release.version}`}
                                </Link>
                                {index >= releases.length - 1 ? '' : ', '}{' '}
                            </li>
                        )
                    })}
                </div>
            ) : (
                <div>
                    {releases.length !== 0 && (
                        <div>
                            <BsCaretRightFill onClick={() => setExpanded(true)} /> {previewString}
                        </div>
                    )}
                </div>
            )}
        </>
    )
}
