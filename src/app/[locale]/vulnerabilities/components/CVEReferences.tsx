// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useTranslations } from 'next-intl'
import { Dispatch, SetStateAction } from 'react'
import { FaTrashAlt } from 'react-icons/fa'

import { CVEReference, Vulnerability } from '@/object-types'

function CVEReferences({
    payload,
    setPayload,
}: {
    payload: Vulnerability
    setPayload: Dispatch<SetStateAction<Vulnerability>>
}) {
    const t = useTranslations('default')

    const addReference = () => {
        setPayload((prev: Vulnerability) => {
            return { ...prev, cveReferences: [...prev.cveReferences, { year: '', number: '' }] }
        })
    }

    const handleChange = (
        e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>,
        i: number
    ) => {
        setPayload((prev: Vulnerability) => {
            const refs = prev.cveReferences
            refs[i][e.target.name as keyof CVEReference] = e.target.value
            return { ...prev, cveReferences: refs }
        })
    }

    const deleteReference = (i: number) => {
        setPayload((prev: Vulnerability) => {
            const refs = prev.cveReferences.slice()
            refs.splice(i, 1)
            return { ...prev, cveReferences: refs }
        })
    }

    return (
        <>
            <div className='row mb-4 mx-0'>
                <div className='row header mb-2 pb-2 px-2'>
                    <h6>{t('CVE References')}</h6>
                </div>
                {payload.cveReferences.map((elem, i) => (
                    <div className='row mb-2' key={i}>
                        <div className='col-lg-5'>
                            <label htmlFor='vulnerabilityDetail.cveReferences.year' className='form-label fw-medium'>
                                {t('CVE Year')}{' '}
                                <span className='text-red' style={{ color: '#F7941E' }}>
                                    *
                                </span>
                            </label>
                            <input
                                type='number'
                                min={0}
                                max={9999}
                                name='year'
                                value={elem.year}
                                onKeyDown={(e) => {
                                    if (e.key === '+' || e.key === '-' || e.key === '.' || e.key === 'e') {
                                        e.preventDefault()
                                    }
                                }}
                                onChange={(e) => {
                                    handleChange(e, i)
                                }}
                                className='form-control'
                                id='vulnerabilityDetail.cveReferences.year'
                                placeholder={t('Enter CVE Year')}
                                required
                            />
                        </div>
                        <div className='col-lg-6'>
                            <label htmlFor='vulnerabilityDetail.cveReferences.number' className='form-label fw-medium'>
                                {t('CVE Number')}{' '}
                                <span className='text-red' style={{ color: '#F7941E' }}>
                                    *
                                </span>
                            </label>
                            <input
                                type='number'
                                min={0}
                                max={999999999}
                                onKeyDown={(e) => {
                                    if (e.key === '+' || e.key === '-' || e.key === '.' || e.key === 'e') {
                                        e.preventDefault()
                                    }
                                }}
                                name='number'
                                value={elem.number}
                                onChange={(e) => {
                                    handleChange(e, i)
                                }}
                                className='form-control'
                                id='vulnerabilityDetail.cveReferences.number'
                                placeholder={t('Enter CVE Number')}
                                required
                            />
                        </div>
                        <div className='col-lg-1 d-flex align-items-end pb-2'>
                            <FaTrashAlt className='btn-icon' size={22} onClick={() => deleteReference(i)} />
                        </div>
                    </div>
                ))}
                <div className='col-lg-4 mt-2'>
                    <button type='button' onClick={addReference} className={`fw-bold btn btn-secondary`}>
                        {t('Click to add CVE Reference')}
                    </button>
                </div>
            </div>
        </>
    )
}

export default CVEReferences
