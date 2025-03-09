// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { useTranslations } from 'next-intl'
import React, { type JSX } from 'react';
import { FaTrashAlt } from 'react-icons/fa'

import { ReleaseLink } from '@/object-types'
import styles from './TableLinkedReleases.module.css'

interface Props {
    setReleaseLinks: React.Dispatch<React.SetStateAction<ReleaseLink[]>>
    releaseLinks: ReleaseLink[]
    setReleaseIdToRelationshipsToReleasePayLoad: (releaseIdToRelationships: Map<string, string>) => void
}

export default function TableLinkedReleases({
    releaseLinks,
    setReleaseLinks,
    setReleaseIdToRelationshipsToReleasePayLoad,
}: Props) : JSX.Element {
    const t = useTranslations('default')
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, index: number) => {
        const { name, value } = e.target
        const list = [...releaseLinks]
        list[index][name as keyof ReleaseLink] = value as never
        const map = new Map<string, string>()
        list.forEach((item) => {
            map.set(item.id, item.releaseRelationship)
        })
        setReleaseLinks(list)
        setReleaseIdToRelationshipsToReleasePayLoad(map)
    }

    const handleClickDelete = (index: number) => {
        const list: ReleaseLink[] = [...releaseLinks]
        list.splice(index, 1)
        const map = new Map<string, string>()
        list.forEach((item) => {
            map.set(item.id, item.releaseRelationship)
        })
        setReleaseLinks(list)
        setReleaseIdToRelationshipsToReleasePayLoad(map)
    }

    return (
        <>
            <div className='row'>
                {releaseLinks.map((item: ReleaseLink, index: number) => {
                    return (
                        <div key={index}>
                            <div className={`${styles['div-row']}`}>
                                <input
                                    className={`${styles['input-field']}`}
                                    name='vendor'
                                    value={item.vendor}
                                    type='text'
                                    placeholder='Enter Vendor'
                                    readOnly
                                />
                                <input
                                    className={`${styles['input-field']}`}
                                    type='text'
                                    value={item.name}
                                    name='name'
                                    readOnly
                                />
                                <input
                                    className={`${styles['input-field']}`}
                                    type='text'
                                    value={item.version}
                                    name='version'
                                    readOnly
                                />
                                <select
                                    className={`${styles['select-relation']}`}
                                    aria-label='releaseRelationship'
                                    id='releaseRelationship'
                                    name='releaseRelationship'
                                    value={item.releaseRelationship}
                                    onChange={(e) => handleInputChange(e, index)}
                                >
                                    <option value='CONTAINED'>{t('CONTAINED')}</option>
                                    <option value='REFERRED'> {t('REFERRED')}</option>
                                    <option value='UNKNOWN'>{t('UNKNOWN')}</option>
                                    <option value='DYNAMICALLY_LINKED'>{t('DYNAMICALLY_LINKED')}</option>
                                    <option value='STATICALLY_LINKED'> {t('STATICALLY_LINKED')}</option>
                                    <option value='SIDE_BY_SIDE'>{t('SIDE_BY_SIDE')}</option>
                                    <option value='STANDALONE'>{t('STANDALONE')}</option>
                                    <option value='INTERNAL_USE'> {t('INTERNAL_USE')}</option>
                                    <option value='OPTIONAL'>{t('OPTIONAL')}</option>
                                    <option value='TO_BE_REPLACED'>{t('TO_BE_REPLACED')}</option>
                                    <option value='CODE_SNIPPET'> {t('CODE_SNIPPET')}</option>
                                </select>
                                <button
                                    type='button'
                                    onClick={() => handleClickDelete(index)}
                                    style={{ border: 'none' }}
                                    className={`fw-bold btn btn-secondary`}
                                >
                                    <FaTrashAlt className='bi bi-trash3-fill' />
                                </button>
                            </div>
                            <hr className={`${styles['hr']}`} />
                        </div>
                    )
                })}
            </div>
        </>
    )
}
