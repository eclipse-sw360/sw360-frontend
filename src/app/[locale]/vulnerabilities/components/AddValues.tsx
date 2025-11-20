// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Dispatch, ReactNode, SetStateAction, useEffect } from 'react'
import { FaTrashAlt } from 'react-icons/fa'
import { Vulnerability } from '@/object-types'

export default function AddValues({
    componentName,
    entityName,
    payloadKeyName,
    payload,
    setPayload,
}: {
    componentName: string
    entityName: string
    payloadKeyName: keyof Vulnerability
    payload: Vulnerability
    setPayload: Dispatch<SetStateAction<Vulnerability>>
}): ReactNode {
    const t = useTranslations('default')
    const { status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [
        status,
    ])

    const addValue = () => {
        setPayload((prev: Vulnerability) => {
            return {
                ...prev,
                [payloadKeyName]: [
                    ...(prev[payloadKeyName] as Array<string>),
                    '',
                ],
            }
        })
    }

    const handleChange = (
        e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>,
        i: number,
    ) => {
        setPayload((prev: Vulnerability) => {
            const refs = prev[payloadKeyName] as string[]
            refs[i] = e.target.value
            return {
                ...prev,
                [payloadKeyName]: refs,
            }
        })
    }

    const deleteValue = (i: number) => {
        setPayload((prev: Vulnerability) => {
            const refs = (prev[payloadKeyName] as string[]).slice()
            refs.splice(i, 1)
            return {
                ...prev,
                [payloadKeyName]: refs,
            }
        })
    }

    return (
        <>
            <div className='row mb-4 mx-0'>
                <div className='row header mb-2 pb-2 px-2'>
                    <h6>{t(componentName)}</h6>
                </div>
                {((payload[payloadKeyName] ?? []) as Array<string>).map((elem, i) => (
                    <div
                        className='row mb-2'
                        key={i}
                    >
                        <div className='col-lg-5'>
                            <input
                                type='text'
                                value={elem}
                                onChange={(e) => {
                                    handleChange(e, i)
                                }}
                                className='form-control'
                                placeholder={t('Enter_Args', {
                                    args: entityName,
                                })}
                            />
                        </div>
                        <div className='col-lg-1 d-flex align-items-end pb-2'>
                            <FaTrashAlt
                                className='btn-icon'
                                size={22}
                                onClick={() => deleteValue(i)}
                            />
                        </div>
                    </div>
                ))}
                <div className='col-lg-4 mt-2'>
                    <button
                        type='button'
                        onClick={addValue}
                        className={`fw-bold btn btn-secondary`}
                    >
                        {t('Click to add', {
                            args: entityName,
                        })}
                    </button>
                </div>
            </div>
        </>
    )
}
