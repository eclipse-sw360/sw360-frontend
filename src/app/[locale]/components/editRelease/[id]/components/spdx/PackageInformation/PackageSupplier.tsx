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
    dataPackageSupplier: InputKeyValue
    setDataPackageSupplier: React.Dispatch<React.SetStateAction<InputKeyValue>>
    setPackageSupplierToPackage: (input: InputKeyValue) => void
    isPackageSupplier: boolean
    setIsPackageSupplier: React.Dispatch<React.SetStateAction<boolean>>
}

function PackageSupplier({
    dataPackageSupplier,
    setDataPackageSupplier,
    setPackageSupplierToPackage,
    isPackageSupplier,
    setIsPackageSupplier,
}: Props): ReactNode {
    const { status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [status])

    const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target
        const list: InputKeyValue = dataPackageSupplier
        list[name as keyof InputKeyValue] = value
        setDataPackageSupplier(list)
        if (CommonUtils.isNullEmptyOrUndefinedString(list.key)) {
            const data: InputKeyValue = {
                key: 'Organization',
                value: list.value,
            }
            setPackageSupplierToPackage(data)
        } else {
            setPackageSupplierToPackage(list)
        }
    }

    const selectPackageSupplierNoasserttion = () => {
        setIsPackageSupplier(false)
        const data: InputKeyValue = {
            key: '',
            value: 'NOASSERTION',
        }
        setPackageSupplierToPackage(data)
    }

    const selectPackageSupplierExist = () => {
        setIsPackageSupplier(true)
        if (CommonUtils.isNullEmptyOrUndefinedString(dataPackageSupplier.value)) {
            const data: InputKeyValue = {
                key: 'Organization',
                value: '',
            }
            setPackageSupplierToPackage(data)
        } else {
            setPackageSupplierToPackage(dataPackageSupplier)
        }
    }

    return (
        <td colSpan={3}>
            <div className='form-group'>
                <label className='lableSPDX'>7.5 Package supplier</label>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <div style={{ display: 'inline-flex', flex: 3, marginRight: '1rem' }}>
                        <input
                            className='spdx-radio'
                            type='radio'
                            name='_sw360_portlet_components_SUPPLIER'
                            value='EXIST'
                            onClick={selectPackageSupplierExist}
                            checked={isPackageSupplier}
                        />
                        <select
                            id='supplierType'
                            style={{ flex: 2, marginRight: '1rem' }}
                            className='form-control form-select'
                            disabled={!isPackageSupplier}
                            value={dataPackageSupplier.key}
                            name='key'
                            onChange={(e) => handleInputChange(e)}
                        >
                            <option value='Organization'>Organization</option>
                            <option value='Person'>Person</option>
                        </select>
                        <input
                            disabled={!isPackageSupplier}
                            style={{ flex: 6, marginRight: '1rem' }}
                            id='supplierValue'
                            className='form-control'
                            type='text'
                            name='value'
                            placeholder='Enter package supplier'
                            onChange={(e) => handleInputChange(e)}
                            value={dataPackageSupplier.value}
                        />
                    </div>
                    <div style={{ flex: 2 }}>
                        <input
                            className='spdx-radio lableSPDX'
                            id='supplierNoAssertion'
                            type='radio'
                            onClick={selectPackageSupplierNoasserttion}
                            checked={!isPackageSupplier}
                            name='_sw360_portlet_components_SUPPLIER'
                            value='NOASSERTION'
                        />
                        <label
                            className='form-check-label radio-label lableSPDX'
                            htmlFor='supplierNoAssertion'
                        >
                            NOASSERTION
                        </label>
                    </div>
                </div>
            </div>
        </td>
    )
}

export default PackageSupplier
