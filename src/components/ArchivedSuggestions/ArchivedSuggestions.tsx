// Copyright Taanvi Khevaria, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useTranslations } from 'next-intl'
import { type JSX, useEffect, useState } from 'react'
import { Badge, Spinner } from 'react-bootstrap'
import { BsArchive } from 'react-icons/bs'
import { ArchivalEntityType, ArchivalRecord } from '@/object-types'
import ArchivalService from '@/services/archival.service'
import { getAuthenticatedAccessToken } from '@/utils/api/authenticatedApi.util'

interface Props {
    entityType: ArchivalEntityType
    // The current value of the name field being typed in the create form.
    name?: string
}

const MIN_CHARS = 2
const DEBOUNCE_MS = 350

/**
 * A typeahead dropdown that appears below a create form's name field: as the admin
 * types, it lists entities of the same type that were archived earlier, so a
 * duplicate can be flagged and restored instead of re-created. Restore is not done
 * here — a "contact admin for restoration" note sits at the bottom.
 */
export default function ArchivedSuggestions({ entityType, name }: Props): JSX.Element | null {
    const t = useTranslations('default')
    const [matches, setMatches] = useState<ArchivalRecord[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const query = (name ?? '').trim()
        if (query.length < MIN_CHARS) {
            setMatches([])
            return
        }
        let cancelled = false
        const handle = setTimeout(() => {
            void (async () => {
                setLoading(true)
                try {
                    const token = await getAuthenticatedAccessToken()
                    const found = await ArchivalService.searchArchived(query, entityType, token)
                    if (!cancelled) setMatches(found)
                } catch {
                    if (!cancelled) setMatches([])
                } finally {
                    if (!cancelled) setLoading(false)
                }
            })()
        }, DEBOUNCE_MS)
        return () => {
            cancelled = true
            clearTimeout(handle)
        }
    }, [
        name,
        entityType,
    ])

    if ((name ?? '').trim().length < MIN_CHARS || matches.length === 0) return null

    return (
        <div className='position-relative'>
            <div
                className='position-absolute w-100 border rounded shadow-sm bg-body mt-1'
                style={{
                    zIndex: 1050,
                    maxHeight: '20rem',
                    overflowY: 'auto',
                }}
            >
                <div className='px-3 py-2 small text-muted border-bottom d-flex align-items-center'>
                    <BsArchive className='me-2' />
                    {t('Similar entities were archived earlier')}
                    {loading && (
                        <Spinner
                            size='sm'
                            className='ms-2'
                        />
                    )}
                </div>
                {matches.map((r) => (
                    <div
                        key={r.id}
                        className='px-3 py-2 border-bottom small'
                    >
                        <Badge
                            bg='dark'
                            className='me-2'
                        >
                            {r.entityType}
                        </Badge>
                        <b>{r.entityName ?? r.entityId}</b>
                        <span className='text-muted ms-2'>
                            {t('Archived by')} {r.archivedBy ?? '-'}
                            {r.archivedAt ? ` · ${new Date(r.archivedAt).toLocaleDateString()}` : ''}
                        </span>
                    </div>
                ))}
                <div className='px-3 py-2 small text-muted border-top'>{t('Contact admin for restoration')}</div>
            </div>
        </div>
    )
}
