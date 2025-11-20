// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { ReactNode } from 'react'
import { PackageInformation } from '@/object-types'
import CommonUtils from '@/utils/common.utils'

interface Props {
    packageInformation: PackageInformation
    setAllLicensesInformationToPackage: React.Dispatch<React.SetStateAction<string | string[]>>
    allLicensesInformationExist: boolean
    setAllLicensesInformationExist: React.Dispatch<React.SetStateAction<boolean>>
    allLicensesInformationNone: boolean
    setAllLicensesInformationNone: React.Dispatch<React.SetStateAction<boolean>>
    allLicensesInformationNoasserttion: boolean
    setAllLicensesInformationNoasserttion: React.Dispatch<React.SetStateAction<boolean>>
    allLicensesInformation: string[]
}

function PackageAllLicensesInformation({
    allLicensesInformation,
    packageInformation,
    setAllLicensesInformationToPackage,
    allLicensesInformationExist,
    setAllLicensesInformationExist,
    allLicensesInformationNone,
    setAllLicensesInformationNone,
    allLicensesInformationNoasserttion,
    setAllLicensesInformationNoasserttion,
}: Props): ReactNode {
    const selectAllLicensesInformationExist = () => {
        setAllLicensesInformationExist(true)
        setAllLicensesInformationNone(false)
        setAllLicensesInformationNoasserttion(false)
        setAllLicensesInformationToPackage(allLicensesInformation)
    }
    const selectAllLicensesInformationNone = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAllLicensesInformationExist(false)
        setAllLicensesInformationNone(true)
        setAllLicensesInformationNoasserttion(false)
        setAllLicensesInformationToPackage(e.target.value.split('\n'))
    }
    const selectAllLicensesInformationNoasserttion = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAllLicensesInformationExist(false)
        setAllLicensesInformationNone(false)
        setAllLicensesInformationNoasserttion(true)
        setAllLicensesInformationToPackage(e.target.value.split('\n'))
    }

    const updateField = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setAllLicensesInformationToPackage(e.target.value.split('\n'))
    }
    return (
        <td colSpan={3}>
            <div className='form-group'>
                <label className='lableSPDX'>7.14 All licenses information from files</label>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                    }}
                >
                    <div
                        style={{
                            display: 'inline-flex',
                            flex: 3,
                            marginRight: '1rem',
                        }}
                    >
                        <input
                            className='spdx-radio'
                            id='licenseInfoFromFilesExist'
                            type='radio'
                            name='licenseInfoFromFilesExist'
                            value='EXIST'
                            onClick={selectAllLicensesInformationExist}
                            checked={allLicensesInformationExist}
                            disabled={
                                !CommonUtils.isNullOrUndefined(packageInformation.filesAnalyzed)
                                    ? !packageInformation.filesAnalyzed
                                    : true
                            }
                        />
                        <textarea
                            style={{
                                flex: 6,
                                marginRight: '1rem',
                            }}
                            id='licenseInfoInFileValue'
                            rows={5}
                            className='form-control'
                            name='licenseInfoFromFiles'
                            placeholder='Enter all licenses information from files'
                            onChange={updateField}
                            value={allLicensesInformation.toString().replaceAll(',', '\n')}
                            disabled={
                                allLicensesInformationNone ||
                                allLicensesInformationNoasserttion ||
                                (!CommonUtils.isNullOrUndefined(packageInformation.filesAnalyzed)
                                    ? !packageInformation.filesAnalyzed
                                    : true)
                            }
                        ></textarea>
                    </div>
                    <div
                        style={{
                            flex: 2,
                        }}
                    >
                        <input
                            className='spdx-radio'
                            id='licenseInfoInFileNone'
                            type='radio'
                            name='licenseInfoInFileNone'
                            value='NONE'
                            onChange={selectAllLicensesInformationNone}
                            checked={allLicensesInformationNone}
                            disabled={
                                !CommonUtils.isNullOrUndefined(packageInformation.filesAnalyzed)
                                    ? !packageInformation.filesAnalyzed
                                    : true
                            }
                        />
                        <label
                            style={{
                                marginRight: '2rem',
                            }}
                            className='form-check-label radio-label lableSPDX'
                            htmlFor='licenseInfoInFileNone'
                        >
                            NONE
                        </label>
                        <input
                            className='spdx-radio'
                            id='licenseInfoFromFilesNoAssertion'
                            type='radio'
                            name='licenseInfoFromFilesNoAssertion'
                            value='NOASSERTION'
                            onChange={selectAllLicensesInformationNoasserttion}
                            checked={allLicensesInformationNoasserttion}
                            disabled={
                                !CommonUtils.isNullOrUndefined(packageInformation.filesAnalyzed)
                                    ? !packageInformation.filesAnalyzed
                                    : true
                            }
                        />
                        <label
                            className='form-check-label radio-label lableSPDX'
                            htmlFor='licenseInfoFromFilesNoAssertion'
                        >
                            NOASSERTION
                        </label>
                    </div>
                </div>
            </div>
        </td>
    )
}

export default PackageAllLicensesInformation
