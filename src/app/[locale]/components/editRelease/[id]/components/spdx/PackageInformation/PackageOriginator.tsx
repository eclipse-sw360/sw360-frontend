// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { InputKeyValue } from '@/object-types'
import CommonUtils from '@/utils/common.utils'
import { signOut, useSession } from 'next-auth/react'
import { ReactNode, useEffect } from 'react'

interface Props {
    dataPackageOriginator: InputKeyValue
    setDataPackageOriginator: React.Dispatch<React.SetStateAction<InputKeyValue>>
    setPackageOriginatorToPackage: (input: InputKeyValue) => void
    isPackageOriginator: boolean
    setIsPackageOriginator: React.Dispatch<React.SetStateAction<boolean>>
}

function PackageOriginator({
    dataPackageOriginator,
    setDataPackageOriginator,
    setPackageOriginatorToPackage,
    isPackageOriginator,
    setIsPackageOriginator,
}: Props): ReactNode {
    const { status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [status])

    const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target
        const list: InputKeyValue = dataPackageOriginator
        list[name as keyof InputKeyValue] = value
        setDataPackageOriginator(list)
        if (CommonUtils.isNullEmptyOrUndefinedString(list.key)) {
            const data: InputKeyValue = {
                key: 'Organization',
                value: list.value,
            }
            setPackageOriginatorToPackage(data)
        } else {
            setPackageOriginatorToPackage(list)
        }
    }

    const selectPackageOriginatorNoasserttion = () => {
        setIsPackageOriginator(false)
        const data: InputKeyValue = {
            key: '',
            value: 'NOASSERTION',
        }
        setPackageOriginatorToPackage(data)
    }

    const selectPackageOriginatorExist = () => {
        setIsPackageOriginator(true)
        if (CommonUtils.isNullEmptyOrUndefinedString(dataPackageOriginator.value)) {
            const data: InputKeyValue = {
                key: 'Organization',
                value: '',
            }
            setPackageOriginatorToPackage(data)
        } else {
            setPackageOriginatorToPackage(dataPackageOriginator)
        }
    }

    return (
        <td colSpan={3}>
            <div className='form-group'>
                <label className='lableSPDX'>7.6 Package originator</label>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <div style={{ display: 'inline-flex', flex: 3, marginRight: '1rem' }}>
                        <input
                            className='spdx-radio'
                            type='radio'
                            name='_sw360_portlet_components_ORIGINATOR'
                            value='EXIST'
                            onClick={selectPackageOriginatorExist}
                            checked={isPackageOriginator}
                        />
                        <select
                            id='originatorType'
                            style={{ flex: 2, marginRight: '1rem' }}
                            className='form-control form-select'
                            disabled={!isPackageOriginator}
                            name='key'
                            value={dataPackageOriginator.key}
                            onChange={handleInputChange}
                        >
                            <option value='Organization'>Organization</option>
                            <option value='Person'>Person</option>
                        </select>
                        <input
                            style={{ flex: 6, marginRight: '1rem' }}
                            className='form-control'
                            id='originatorValue'
                            type='text'
                            name='value'
                            placeholder='Enter package originator'
                            onChange={handleInputChange}
                            value={dataPackageOriginator.value}
                            disabled={!isPackageOriginator}
                        />
                    </div>
                    <div style={{ flex: 2 }}>
                        <input
                            className='spdx-radio'
                            id='originatorNoAssertion'
                            type='radio'
                            name='_sw360_portlet_components_ORIGINATOR'
                            value='NOASSERTION'
                            onClick={selectPackageOriginatorNoasserttion}
                            checked={!isPackageOriginator}
                        />
                        <label
                            className='form-check-label radio-label lableSPDX'
                            htmlFor='originatorNoAssertion'
                        >
                            NOASSERTION
                        </label>
                    </div>
                </div>
            </div>
        </td>
    )
}

export default PackageOriginator
