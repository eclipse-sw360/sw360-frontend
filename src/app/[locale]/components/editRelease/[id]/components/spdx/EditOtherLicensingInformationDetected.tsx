// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import { OtherLicensingInformationDetected, SPDX } from '@/object-types'
import CommonUtils from '@/utils/common.utils'
import { useEffect, useState } from 'react'
import { FaTrashAlt } from 'react-icons/fa'
import styles from '../detail.module.css'

interface Props {
    isModeFull?: boolean
    indexOtherLicense?: number
    setIndexOtherLicense?: React.Dispatch<React.SetStateAction<number>>
    otherLicensingInformationDetecteds?: OtherLicensingInformationDetected[]
    setOtherLicensingInformationDetecteds?: React.Dispatch<React.SetStateAction<OtherLicensingInformationDetected[]>>
    SPDXPayload?: SPDX
    setSPDXPayload?: React.Dispatch<React.SetStateAction<SPDX>>
    errorLicenseIdentifier?: boolean
    errorExtractedText?: boolean
    inputValid?: boolean
    setErrorLicenseIdentifier?: React.Dispatch<React.SetStateAction<boolean>>
    setErrorExtractedText?: React.Dispatch<React.SetStateAction<boolean>>
    toggleOther?: boolean
    setToggleOther?: React.Dispatch<React.SetStateAction<boolean>>
}

const EditOtherLicensingInformationDetected = ({
    isModeFull,
    indexOtherLicense,
    setIndexOtherLicense,
    otherLicensingInformationDetecteds,
    setOtherLicensingInformationDetecteds,
    SPDXPayload,
    setSPDXPayload,
    errorLicenseIdentifier,
    errorExtractedText,
    setErrorExtractedText,
    setErrorLicenseIdentifier,
    inputValid,
    toggleOther,
    setToggleOther,
}: Props) => {
    const [increIndex, setIncreIndex] = useState(0)
    const [isAdd, setIsAdd] = useState(false)

    const displayIndex = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (
            CommonUtils.isNullEmptyOrUndefinedString(
                otherLicensingInformationDetecteds[indexOtherLicense]?.licenseId
            ) ||
            otherLicensingInformationDetecteds[indexOtherLicense].licenseId === 'LicenseRef-'
        ) {
            setErrorLicenseIdentifier(true)
        }
        if (
            CommonUtils.isNullEmptyOrUndefinedString(
                otherLicensingInformationDetecteds[indexOtherLicense]?.extractedText
            )
        ) {
            setErrorExtractedText(true)
        }
        if (
            CommonUtils.isNullEmptyOrUndefinedString(
                otherLicensingInformationDetecteds[indexOtherLicense]?.licenseId
            ) ||
            otherLicensingInformationDetecteds[indexOtherLicense].licenseId === 'LicenseRef-' ||
            CommonUtils.isNullEmptyOrUndefinedString(
                otherLicensingInformationDetecteds[indexOtherLicense]?.extractedText
            )
        ) {
            return
        } else {
            const index: string = e.target.value
            if (parseInt(index) === increIndex) {
                setIsAdd(true)
            } else {
                setIncreIndex(parseInt(index))
            }
            setIndexOtherLicense(parseInt(index))
            setNumberIndex(parseInt(index))
        }
    }

    const addOtherLicensingInformationDetecteds = () => {
        if (
            (CommonUtils.isNullEmptyOrUndefinedString(
                otherLicensingInformationDetecteds[indexOtherLicense]?.licenseId
            ) ||
                otherLicensingInformationDetecteds[indexOtherLicense].licenseId === 'LicenseRef-' ||
                CommonUtils.isNullEmptyOrUndefinedString(
                    otherLicensingInformationDetecteds[indexOtherLicense]?.extractedText
                )) &&
            !CommonUtils.isNullEmptyOrUndefinedArray(otherLicensingInformationDetecteds)
        ) {
            if (
                CommonUtils.isNullEmptyOrUndefinedString(
                    otherLicensingInformationDetecteds[indexOtherLicense]?.licenseId
                ) ||
                otherLicensingInformationDetecteds[indexOtherLicense].licenseId === 'LicenseRef-'
            ) {
                setErrorLicenseIdentifier(true)
            }
            if (
                CommonUtils.isNullEmptyOrUndefinedString(
                    otherLicensingInformationDetecteds[indexOtherLicense]?.extractedText
                )
            ) {
                setErrorExtractedText(true)
            }
        } else {
            const arrayExternals: OtherLicensingInformationDetected[] = [...otherLicensingInformationDetecteds]
            setIncreIndex(otherLicensingInformationDetecteds.length)
            setNumberIndex(otherLicensingInformationDetecteds.length)
            setIsAdd(true)
            const otherLicensingInformationDetected: OtherLicensingInformationDetected = {
                licenseId: '', // 10.1
                extractedText: '', // 10.2
                licenseName: '', // 10.3
                licenseCrossRefs: [], // 10.4
                licenseComment: '', // 10.5
                index: otherLicensingInformationDetecteds.length,
            }
            setHasLicenseName(true)
            setIndexOtherLicense(otherLicensingInformationDetecteds.length)
            arrayExternals.push(otherLicensingInformationDetected)
            setOtherLicensingInformationDetecteds(arrayExternals)
            setSPDXPayload({
                ...SPDXPayload,
                spdxDocument: {
                    ...SPDXPayload.spdxDocument,
                    otherLicensingInformationDetecteds: arrayExternals,
                },
            })
        }
    }

    const updateField = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
        if (e.target.name === 'extractedText') {
            setErrorExtractedText(false)
        }

        const otherLicensings: OtherLicensingInformationDetected[] = otherLicensingInformationDetecteds.map(
            (otherLicensing, index) => {
                if (index === indexOtherLicense) {
                    return {
                        ...otherLicensing,
                        [e.target.name]:
                            e.target.name === 'licenseCrossRefs' ? e.target.value.split('\n') : e.target.value,
                    }
                }
                return otherLicensing
            }
        )
        setOtherLicensingInformationDetecteds(otherLicensings)
        setSPDXPayload({
            ...SPDXPayload,
            spdxDocument: {
                ...SPDXPayload.spdxDocument,
                otherLicensingInformationDetecteds: otherLicensings,
            },
        })
    }

    const updateFieldLicenseCrossRefs = (
        e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const otherLicensings: OtherLicensingInformationDetected[] = otherLicensingInformationDetecteds.map(
            (otherLicensing, index) => {
                if (index === indexOtherLicense) {
                    return {
                        ...otherLicensing,
                        [e.target.name]: e.target.value.split('\n'),
                    }
                }
                return otherLicensing
            }
        )
        setOtherLicensingInformationDetecteds(otherLicensings)
        setSPDXPayload({
            ...SPDXPayload,
            spdxDocument: {
                ...SPDXPayload.spdxDocument,
                otherLicensingInformationDetecteds: otherLicensings,
            },
        })
    }

    const updateFieldLicenseIdentifier = (e: React.ChangeEvent<HTMLInputElement>) => {
        setErrorLicenseIdentifier(false)
        const otherLicensings: OtherLicensingInformationDetected[] = otherLicensingInformationDetecteds.map(
            (otherLicensing, index) => {
                if (index === indexOtherLicense) {
                    return {
                        ...otherLicensing,
                        [e.target.name]: 'LicenseRef-' + e.target.value,
                    }
                }
                return otherLicensing
            }
        )
        setOtherLicensingInformationDetecteds(otherLicensings)
        setSPDXPayload({
            ...SPDXPayload,
            spdxDocument: {
                ...SPDXPayload.spdxDocument,
                otherLicensingInformationDetecteds: otherLicensings,
            },
        })
    }

    const [numberIndex, setNumberIndex] = useState<number>(0)
    const [isDeleteSucces, setIsDeleteSucces] = useState(false)

    const deleteOtherLicenses = () => {
        setErrorExtractedText(false)
        setErrorLicenseIdentifier(false)
        if (otherLicensingInformationDetecteds.length == 1) {
            setOtherLicensingInformationDetecteds([])
            setSPDXPayload({
                ...SPDXPayload,
                spdxDocument: {
                    ...SPDXPayload.spdxDocument,
                    otherLicensingInformationDetecteds: [],
                },
            })
        } else {
            let otherLicensingInformationDetectedDatas: OtherLicensingInformationDetected[] = []
            otherLicensingInformationDetectedDatas = otherLicensingInformationDetecteds.filter(
                (otherLicensingInformationDetected) => numberIndex != otherLicensingInformationDetected.index
            )
            setNumberIndex(indexOtherLicense)
            for (let index = 0; index < otherLicensingInformationDetectedDatas.length; index++) {
                otherLicensingInformationDetectedDatas[index].index = index
            }
            setOtherLicensingInformationDetecteds(otherLicensingInformationDetectedDatas)
            setIndexOtherLicense(0)
            setIsDeleteSucces(true)
            setSPDXPayload({
                ...SPDXPayload,
                spdxDocument: {
                    ...SPDXPayload.spdxDocument,
                    otherLicensingInformationDetecteds: otherLicensingInformationDetectedDatas,
                },
            })
            if (!CommonUtils.isNullEmptyOrUndefinedArray(otherLicensingInformationDetectedDatas)) {
                setNumberIndex(otherLicensingInformationDetectedDatas[0].index)
            }
        }
    }

    useEffect(() => {
        if (typeof otherLicensingInformationDetecteds[indexOtherLicense]?.licenseName !== 'undefined') {
            if (
                otherLicensingInformationDetecteds[indexOtherLicense]?.licenseName === 'NONE' ||
                otherLicensingInformationDetecteds[indexOtherLicense]?.licenseName === 'NOASSERTION'
            ) {
                setLicenseName('')
                setHasLicenseName(false)
            } else {
                setHasLicenseName(true)
                setLicenseName(otherLicensingInformationDetecteds[indexOtherLicense].licenseName)
            }
        }
    }, [indexOtherLicense, otherLicensingInformationDetecteds])

    const [licenseName, setLicenseName] = useState('')
    const [hasLicenseName, setHasLicenseName] = useState(true)

    const setLicenseNameToOtherLicense = (data: string) => {
        const otherLicenses: OtherLicensingInformationDetected[] = otherLicensingInformationDetecteds.map(
            (otherLicense, index) => {
                if (index === indexOtherLicense) {
                    return {
                        ...otherLicense,
                        licenseName: data,
                    }
                }
                return otherLicense
            }
        )
        setOtherLicensingInformationDetecteds(otherLicenses)
        setSPDXPayload({
            ...SPDXPayload,
            spdxDocument: {
                ...SPDXPayload.spdxDocument,
                otherLicensingInformationDetecteds: otherLicenses,
            },
        })
    }

    const selectLicenseNameNoasserttion = (e: React.ChangeEvent<HTMLInputElement>) => {
        setHasLicenseName(false)
        setLicenseNameToOtherLicense(e.target.value)
    }

    const selectLicenseNameNoasserttionExist = () => {
        setHasLicenseName(true)
        setLicenseNameToOtherLicense(licenseName)
    }

    const isNoneOrNoasserttionString = (data: string) => {
        if (data === 'NONE' || data === 'NOASSERTION') {
            return false
        }
        return true
    }

    return (
        <table className={`table label-value-table ${styles['summary-table']}`}>
            <thead
                title='Click to expand or collapse'
                onClick={() => {
                    setToggleOther(!toggleOther)
                }}
            >
                <tr>
                    <th colSpan={3}>10. Other Licensing Information Detected</th>
                </tr>
            </thead>
            <tbody hidden={toggleOther}>
                <tr>
                    <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0.75rem' }}>
                                <label
                                    htmlFor='selectOtherLicensing'
                                    style={{ textDecoration: 'underline', width: '175px', marginRight: 'auto' }}
                                    className='sub-title lableSPDX'
                                >
                                    Select Other Licensing
                                </label>
                                <select
                                    id='selectOtherLicensing'
                                    className='form-control spdx-select form-select'
                                    onChange={displayIndex}
                                    disabled={CommonUtils.isNullEmptyOrUndefinedArray(
                                        otherLicensingInformationDetecteds
                                    )}
                                    value={isAdd ? (isDeleteSucces ? indexOtherLicense : increIndex) : numberIndex}
                                >
                                    {otherLicensingInformationDetecteds.map((item) => (
                                        <option key={item.index} value={item.index}>
                                            {item.index + 1}
                                        </option>
                                    ))}
                                </select>
                                <FaTrashAlt className='spdx-delete-icon-main' onClick={deleteOtherLicenses} />
                            </div>
                            <button
                                className='spdx-add-button-main'
                                name='add-otherLicensing'
                                onClick={addOtherLicensingInformationDetecteds}
                            >
                                Add new Licensing
                            </button>
                        </div>
                    </td>
                </tr>
                {otherLicensingInformationDetecteds[indexOtherLicense] && (
                    <>
                        <tr>
                            <td>
                                <div className='form-group'>
                                    <label className='mandatory lableSPDX' htmlFor='licenseId'>
                                        10.1 License identifier
                                        <span className='text-red' style={{ color: '#F7941E' }}>
                                            *
                                        </span>
                                    </label>
                                    <div style={{ display: 'flex' }}>
                                        <label className='sub-label'>LicenseRef-</label>
                                        <input
                                            id='licenseId'
                                            className={`form-control ${errorLicenseIdentifier ? 'is-invalid' : ''} ${
                                                !errorLicenseIdentifier && inputValid ? 'is-valid' : ''
                                            }`}
                                            type='text'
                                            style={{ backgroundColor: errorLicenseIdentifier ? '#feefef' : '' }}
                                            placeholder='Enter license identifier'
                                            name='licenseId'
                                            onChange={updateFieldLicenseIdentifier}
                                            value={
                                                otherLicensingInformationDetecteds[
                                                    indexOtherLicense
                                                ].licenseId?.startsWith('LicenseRef-')
                                                    ? otherLicensingInformationDetecteds[
                                                          indexOtherLicense
                                                      ].licenseId?.substring(11)
                                                    : otherLicensingInformationDetecteds[indexOtherLicense].licenseId
                                            }
                                        />
                                    </div>
                                    {errorLicenseIdentifier && (
                                        <div
                                            style={{
                                                color: '#da1414',
                                                fontSize: '0.875rem',
                                                marginTop: '0.25rem',
                                                width: '100%',
                                            }}
                                        >
                                            <span>This field must be not empty!</span>
                                        </div>
                                    )}
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div className='form-group'>
                                    <label className='mandatory lableSPDX' htmlFor='extractedText'>
                                        10.2 Extracted text
                                        <span className='text-red' style={{ color: '#F7941E' }}>
                                            *
                                        </span>
                                    </label>
                                    <textarea
                                        className={`form-control ${errorExtractedText ? 'is-invalid ' : ''} ${
                                            !errorExtractedText && inputValid ? 'is-valid' : ''
                                        }`}
                                        style={{ backgroundColor: errorExtractedText ? '#feefef' : '' }}
                                        id='extractedText'
                                        rows={5}
                                        name='extractedText'
                                        onChange={updateField}
                                        placeholder='Enter extracted text'
                                        value={
                                            otherLicensingInformationDetecteds[indexOtherLicense].extractedText ?? ''
                                        }
                                    ></textarea>
                                </div>
                                {errorExtractedText && (
                                    <div
                                        style={{
                                            color: '#da1414',
                                            fontSize: '0.875rem',
                                            marginTop: '0.25rem',
                                            width: '100%',
                                        }}
                                    >
                                        <span>This field must be not empty!</span>
                                    </div>
                                )}
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={3}>
                                <div className='form-group'>
                                    <label className='lableSPDX'>10.3 License name</label>
                                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                                        <div style={{ display: 'inline-flex', flex: 3, marginRight: '1rem' }}>
                                            <input
                                                className='spdx-radio'
                                                id='licenseNameExist'
                                                type='radio'
                                                name='licenseName'
                                                value='EXIST'
                                                onChange={selectLicenseNameNoasserttionExist}
                                                checked={hasLicenseName}
                                            />
                                            <input
                                                style={{ flex: 6, marginRight: '1rem' }}
                                                id='licenseName'
                                                className='form-control needs-validation'
                                                type='text'
                                                placeholder='Enter license name'
                                                name='licenseName'
                                                onChange={updateField}
                                                value={
                                                    isNoneOrNoasserttionString(
                                                        otherLicensingInformationDetecteds[indexOtherLicense]
                                                            .licenseName
                                                    )
                                                        ? otherLicensingInformationDetecteds[indexOtherLicense]
                                                              .licenseName ?? ''
                                                        : ''
                                                }
                                                disabled={!hasLicenseName}
                                            />
                                        </div>
                                        <div style={{ flex: 2 }}>
                                            <input
                                                className='spdx-radio'
                                                id='licenseNameNoAssertion'
                                                type='radio'
                                                name='licenseName'
                                                value='NOASSERTION'
                                                onChange={selectLicenseNameNoasserttion}
                                                checked={!hasLicenseName}
                                            />
                                            <label
                                                className='form-check-label radio-label lableSPDX'
                                                htmlFor='licenseNameNoAssertion'
                                            >
                                                NOASSERTION
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        {isModeFull && (
                            <tr className='spdx-full'>
                                <td>
                                    <div className='form-group'>
                                        <label className='lableSPDX' htmlFor='licenseCrossRefs'>
                                            10.4 License cross reference
                                        </label>
                                        <textarea
                                            className='form-control'
                                            id='licenseCrossRefs'
                                            rows={5}
                                            placeholder='Enter license cross reference'
                                            name='licenseCrossRefs'
                                            onChange={updateFieldLicenseCrossRefs}
                                            value={
                                                otherLicensingInformationDetecteds[indexOtherLicense].licenseCrossRefs
                                                    ?.toString()
                                                    .replaceAll(',', '\n') ?? ''
                                            }
                                        ></textarea>
                                    </div>
                                </td>
                            </tr>
                        )}
                        <tr>
                            <td>
                                <div className='form-group'>
                                    <label className='lableSPDX' htmlFor='licenseComment'>
                                        10.5 License comment
                                    </label>
                                    <textarea
                                        className='form-control'
                                        id='licenseComment'
                                        rows={5}
                                        placeholder='Enter license comment'
                                        name='licenseComment'
                                        onChange={updateField}
                                        value={
                                            otherLicensingInformationDetecteds[indexOtherLicense].licenseComment ?? ''
                                        }
                                    ></textarea>
                                </div>
                            </td>
                        </tr>
                    </>
                )}
            </tbody>
        </table>
    )
}

export default EditOtherLicensingInformationDetected
