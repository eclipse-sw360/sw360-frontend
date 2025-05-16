// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import { Creator, DocumentCreationInformation, ExternalDocumentReferences, InputKeyValue, SPDX } from '@/object-types'
import CommonUtils from '@/utils/common.utils'
import React, { ReactNode, useEffect, useState } from 'react'
import { FaTrashAlt } from 'react-icons/fa'
import Created from './DocumentCreationInfo/Created'
import Creators from './DocumentCreationInfo/Creators'

interface Props {
    documentCreationInformation: DocumentCreationInformation
    setDocumentCreationInformation: React.Dispatch<React.SetStateAction<DocumentCreationInformation>>
    isModeFull: boolean
    externalDocumentRefs?: ExternalDocumentReferences[]
    setExternalDocumentRefs: React.Dispatch<React.SetStateAction<ExternalDocumentReferences[]>>
    indexExternalDocumentRef: number
    setIndexExternalDocumentRef: React.Dispatch<React.SetStateAction<number>>
    SPDXPayload: SPDX
    setSPDXPayload: React.Dispatch<React.SetStateAction<SPDX>>
    errorCreator: boolean
    setErrorCreator: React.Dispatch<React.SetStateAction<boolean>>
}

const EditDocumentCreationInformation = ({
    documentCreationInformation,
    setDocumentCreationInformation,
    isModeFull,
    externalDocumentRefs,
    setExternalDocumentRefs,
    indexExternalDocumentRef,
    setIndexExternalDocumentRef,
    SPDXPayload,
    setSPDXPayload,
    errorCreator,
    setErrorCreator,
}: Props) : ReactNode => {
    const [toggle, setToggle] = useState(false)

    const [creator, setCreator] = useState<InputKeyValue[]>([])
    const [numberIndex, setNumberIndex] = useState<number>(0)
    const [increIndex, setIncreIndex] = useState(0)
    const [isAdd, setIsAdd] = useState(false)
    const [isAnonymous, setIsAnonymous] = useState(false)

    const displayIndex = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const index: string = e.target.value
        if (parseInt(index) === increIndex) {
            setIsAdd(true)
        } else {
            setIncreIndex(parseInt(index))
        }
        setIndexExternalDocumentRef(parseInt(index))
        setNumberIndex(parseInt(index))
    }

    const addDocumentReferences = () => {
        const arrayExternals: ExternalDocumentReferences[] = externalDocumentRefs ? [...externalDocumentRefs] : []
        setIncreIndex(externalDocumentRefs ? externalDocumentRefs.length : 0)
        setNumberIndex(externalDocumentRefs ? externalDocumentRefs.length : 0)
        setIsAdd(true)
        const externalDocumentReference: ExternalDocumentReferences = {
            externalDocumentId: '',
            checksum: { algorithm: '', checksumValue: '', index: 0 },
            spdxDocument: '',
            index: externalDocumentRefs ? externalDocumentRefs.length : 0,
        }
        setIndexExternalDocumentRef(externalDocumentRefs ? externalDocumentRefs.length : 0)
        arrayExternals.push(externalDocumentReference)
        setExternalDocumentRefs(arrayExternals)
        setSPDXPayload({
            ...SPDXPayload,
            documentCreationInformation: {
                ...SPDXPayload.documentCreationInformation,
                externalDocumentRefs: arrayExternals,
            } as DocumentCreationInformation,
        })
    }

    useEffect(() => {
        if (!CommonUtils.isNullEmptyOrUndefinedString(documentCreationInformation.created)) {
            setDataCreated(handleCreated(documentCreationInformation.created))
        } else {
            setDataCreated(handleCreated(new Date().toISOString()))
        }
    }, [documentCreationInformation.created])


    useEffect(() => {
        if (!CommonUtils.isNullEmptyOrUndefinedArray(documentCreationInformation.creator)) {
            if (!isAnonymous) {
                setCreator(
                    convertCreator(documentCreationInformation.creator.toSorted((e1, e2) => e1.index - e2.index))
                )
            }
        }
    }, [documentCreationInformation.creator])

    const convertCreator = (creators: Creator[]) => {
        const inputs: InputKeyValue[] = []
        creators.forEach((creator: Creator) => {
            const input: InputKeyValue = {
                key: creator.type,
                value: creator.value,
            }
            inputs.push(input)
        })
        return inputs
    }

    const convertInputToCreator = (datas: InputKeyValue[] | undefined | null) => {
        if (CommonUtils.isNullOrUndefined(datas)) {
            return []
        }
        const creators: Creator[] = []
        datas.forEach((data: InputKeyValue, index: number) => {
            const creator: Creator = {
                type: data.key,
                value: data.value,
                index: index,
            }
            creators.push(creator)
        })

        return creators
    }

    const updateField = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setDocumentCreationInformation({
            ...documentCreationInformation,
            [e.target.name]: e.target.value,
        } as DocumentCreationInformation)
        setSPDXPayload({
            ...SPDXPayload,
            documentCreationInformation: {
                ...SPDXPayload.documentCreationInformation,
                [e.target.name]: e.target.value,
            } as DocumentCreationInformation,
        })
    }

    const updateFieldSPDXVersion = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDocumentCreationInformation({
            ...documentCreationInformation,
            [e.target.name]: e.target.value,
        } as DocumentCreationInformation)
        setSPDXPayload({
            ...SPDXPayload,
            documentCreationInformation: {
                ...SPDXPayload.documentCreationInformation,
                [e.target.name]: 'SPDX-' + e.target.value,
            } as DocumentCreationInformation,
        })
    }

    const updateFieldSPDXIdentifier = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDocumentCreationInformation({
            ...documentCreationInformation,
            [e.target.name]: e.target.value,
        } as DocumentCreationInformation)
        setSPDXPayload({
            ...SPDXPayload,
            documentCreationInformation: {
                ...SPDXPayload.documentCreationInformation,
                [e.target.name]: 'SPDXRef-' + e.target.value,
            } as DocumentCreationInformation,
        })
    }

    const handleClickAnonymous = () => {
        setIsAnonymous(!isAnonymous)
        if (!isAnonymous) {
            let creators: InputKeyValue[] = []
            creators = creator.filter((input) => input.key != 'Organization').filter((input) => input.key != 'Person')
            setDocumentCreationInformation({
                ...documentCreationInformation,
                creator: convertInputToCreator(creators),
            } as DocumentCreationInformation)
            setSPDXPayload({
                ...SPDXPayload,
                documentCreationInformation: {
                    ...SPDXPayload.documentCreationInformation,
                    creator: convertInputToCreator(creators),
                } as DocumentCreationInformation,
            })
        } else {
            setSPDXPayload({
                ...SPDXPayload,
                documentCreationInformation: {
                    ...SPDXPayload.documentCreationInformation,
                    creator: convertInputToCreator(creator),
                } as DocumentCreationInformation,
            })
        }
    }

    const setDataCreators = (inputs: InputKeyValue[]) => {
        setErrorCreator(false)
        if (isAnonymous) {
            inputs = inputs.filter((input) => input.key != 'Organization').filter((input) => input.key != 'Person')
        }
        setDocumentCreationInformation({
            ...documentCreationInformation,
            creator: convertInputToCreator(inputs),
        } as DocumentCreationInformation)

        setSPDXPayload({
            ...SPDXPayload,
            documentCreationInformation: {
                ...SPDXPayload.documentCreationInformation,
                creator: convertInputToCreator(inputs),
            } as DocumentCreationInformation,
        })
    }

    const [dataCreated, setDataCreated] = useState<InputKeyValue>()
    const handleCreated = (data: string) => {
        const input: InputKeyValue = {
            key: CommonUtils.fillDate(data),
            value: CommonUtils.fillTime(data),
        }
        return input
    }

    const convertInputToCreated = (data: InputKeyValue | null | undefined) => {
        if (!data) return ''
        if (data.key == '' || data.value == '') {
            return ''
        }
        const localDate = new Date(data.key + ' ' + data.value)
        if (isNaN(+localDate)) return ''
        return localDate.toISOString().slice(0, -5) + 'Z'
    }

    const setCreated = (inputs: InputKeyValue) => {
        if (CommonUtils.isNullEmptyOrUndefinedString(convertInputToCreated(inputs))) {
            setSPDXPayload({
                ...SPDXPayload,
                documentCreationInformation: {
                    ...SPDXPayload.documentCreationInformation,
                    created: new Date().toISOString(),
                } as DocumentCreationInformation,
            })
        } else {
            setSPDXPayload({
                ...SPDXPayload,
                documentCreationInformation: {
                    ...SPDXPayload.documentCreationInformation,
                    created: convertInputToCreated(inputs),
                } as DocumentCreationInformation,
            })
        }
    }

    const [isDeleteSucces, setIsDeleteSucces] = useState(false)

    const deleteExternalReference = () => {
        if (!externalDocumentRefs) return
        if (externalDocumentRefs.length == 1) {
            setExternalDocumentRefs([])
        } else {
            console.log(externalDocumentRefs)
            let externalDocuments: ExternalDocumentReferences[] = []
            externalDocuments = externalDocumentRefs.filter(
                (externalDocumentRef) => numberIndex != externalDocumentRef.index
            )
            setNumberIndex(indexExternalDocumentRef)
            for (let index = 0; index < externalDocuments.length; index++) {
                externalDocuments[index].index = index
            }
            setIsDeleteSucces(true)
            setExternalDocumentRefs(externalDocuments)
            setIndexExternalDocumentRef(0)
            setSPDXPayload({
                ...SPDXPayload,
                documentCreationInformation: {
                    ...SPDXPayload.documentCreationInformation,
                    externalDocumentRefs: externalDocuments,
                } as DocumentCreationInformation,
            })
            if (!CommonUtils.isNullEmptyOrUndefinedArray(externalDocumentRefs)) {
                setNumberIndex(externalDocuments[0].index)
            }
        }
    }

    const updateCheckSum = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
        const externals: ExternalDocumentReferences[] = externalDocumentRefs ? externalDocumentRefs.map((externalDocument, index) => {
            if (index === indexExternalDocumentRef) {
                return {
                    ...externalDocument,
                    checksum: {
                        ...externalDocument.checksum,
                        [e.target.name]: e.target.value,
                    },
                }
            }
            return externalDocument
        }) : []
        setExternalDocumentRefs(externals)
        setSPDXPayload({
            ...SPDXPayload,
            documentCreationInformation: {
                ...SPDXPayload.documentCreationInformation,
                externalDocumentRefs: externals,
            } as DocumentCreationInformation,
        })
    }

    const updateExternalReferens = (
        e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const externals: ExternalDocumentReferences[] = externalDocumentRefs ? externalDocumentRefs.map((externalDocument, index) => {
            if (index === indexExternalDocumentRef) {
                return {
                    ...externalDocument,
                    [e.target.name]: e.target.value,
                }
            }
            return externalDocument
        }) : []

        setExternalDocumentRefs(externals)
        setSPDXPayload({
            ...SPDXPayload,
            documentCreationInformation: {
                ...SPDXPayload.documentCreationInformation,
                externalDocumentRefs: externals,
            } as DocumentCreationInformation,
        })
    }

    return (
        <table className='table summary-table'>
            <thead
                title='Click to expand or collapse'
                onClick={() => {
                    setToggle(!toggle)
                }}
            >
                <tr>
                    <th colSpan={3}>6. Document Creation Information</th>
                </tr>
            </thead>
            <tbody hidden={toggle}>
                <>
                    <tr>
                        <td>
                            <div className='form-group' style={{ flex: 1 }}>
                                <label className='lableSPDX' htmlFor='spdxVersion'>
                                    6.1 SPDX version
                                </label>
                                <div style={{ display: 'flex' }}>
                                    <label className='sub-label'>SPDX-</label>
                                    <input
                                        id='spdxVersion'
                                        name='spdxVersion'
                                        className='form-control needs-validation'
                                        type='text'
                                        placeholder='Enter SPDX version'
                                        onChange={updateFieldSPDXVersion}
                                        value={
                                            !CommonUtils.isNullEmptyOrUndefinedString(documentCreationInformation.spdxVersion)
                                            ?
                                                documentCreationInformation.spdxVersion.startsWith('SPDX-')
                                                    ? documentCreationInformation.spdxVersion.substring(5)
                                                    : documentCreationInformation.spdxVersion
                                            : ''
                                        }
                                    />
                                </div>
                            </div>
                        </td>
                        <td>
                            <div className='form-group' style={{ flex: 1 }}>
                                <label className='lableSPDX' htmlFor='dataLicense'>
                                    6.2 Data license
                                </label>
                                <input
                                    id='dataLicense'
                                    name='dataLicense'
                                    className='form-control needs-validation'
                                    type='text'
                                    placeholder='Enter data license'
                                    onChange={updateField}
                                    value={documentCreationInformation.dataLicense ?? ''}
                                />
                            </div>
                        </td>
                        <td>
                            <div className='form-group' style={{ flex: 1 }}>
                                <label className='lableSPDX' htmlFor='spdxIdentifier'>
                                    6.3 SPDX identifier
                                </label>
                                <div style={{ display: 'flex' }}>
                                    <label className='sub-label'>SPDXRef-</label>
                                    <input
                                        id='spdxIdentifier'
                                        name='SPDXID'
                                        className='form-control needs-validation'
                                        type='text'
                                        placeholder='Enter SPDX identifier'
                                        onChange={updateFieldSPDXIdentifier}
                                        value={
                                            !CommonUtils.isNullEmptyOrUndefinedString(documentCreationInformation.SPDXID)
                                            ?
                                                documentCreationInformation.SPDXID.startsWith('SPDXRef-')
                                                    ? documentCreationInformation.SPDXID.substring(8)
                                                    : documentCreationInformation.SPDXID
                                            : ''
                                        }
                                    />
                                </div>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={3}>
                            <div className='form-group'>
                                <label className='lableSPDX' htmlFor='documentName'>
                                    6.4 Document name
                                </label>
                                <input
                                    id='documentName'
                                    name='name'
                                    type='text'
                                    className='form-control needs-validation'
                                    placeholder='Enter document name'
                                    onChange={updateField}
                                    value={documentCreationInformation.name ?? ''}
                                />
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={3}>
                            <div className='form-group'>
                                <label className='lableSPDX' htmlFor='documentNamespace'>
                                    6.5 SPDX document namespace
                                </label>
                                <input
                                    id='documentNamespace'
                                    name='documentNamespace'
                                    className='form-control needs-validation'
                                    type='text'
                                    placeholder='Enter SPDX document namespace'
                                    onChange={updateField}
                                    value={documentCreationInformation.documentNamespace ?? ''}
                                />
                            </div>
                        </td>
                    </tr>
                    {isModeFull && (
                        <>
                            <tr>
                                <td className='spdx-full' colSpan={3}>
                                    <div className='form-group section section-external-doc-ref'>
                                        <label className='lableSPDX' htmlFor='externalDocumentRefs'>
                                            6.6 External document references
                                        </label>
                                        <br></br>
                                        <div
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                paddingLeft: '1rem',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    marginBottom: '0.75rem',
                                                }}
                                            >
                                                <label
                                                    className='lableSPDX sub-title'
                                                    htmlFor='externalDocumentRefs'
                                                    style={{ textDecoration: 'underline' }}
                                                >
                                                    Select Reference
                                                </label>
                                                <select
                                                    id='externalDocumentRefs'
                                                    className='form-control spdx-select form-select'
                                                    onChange={displayIndex}
                                                    disabled={CommonUtils.isNullEmptyOrUndefinedArray(
                                                        externalDocumentRefs
                                                    )}
                                                    value={
                                                        isAdd
                                                            ? isDeleteSucces
                                                                ? indexExternalDocumentRef
                                                                : increIndex
                                                            : numberIndex
                                                    }
                                                >
                                                    {externalDocumentRefs && externalDocumentRefs.map((item) => (
                                                        <option key={item.index} value={item.index}>
                                                            {item.index + 1}
                                                        </option>
                                                    ))}
                                                </select>
                                                <FaTrashAlt
                                                    className='spdx-delete-icon-main-index'
                                                    onClick={deleteExternalReference}
                                                />
                                            </div>
                                            <button
                                                className='spdx-add-button-main'
                                                name='add-externalDocRef'
                                                onClick={addDocumentReferences}
                                            >
                                                Add new Reference
                                            </button>
                                        </div>

                                        <div
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'row',
                                                marginBottom: '0.75rem',
                                            }}
                                        >
                                            <label className='sub-title lableSPDX' htmlFor='externalDocumentId'>
                                                External document ID
                                            </label>
                                            <input
                                                id='externalDocumentId'
                                                style={{ width: 'auto', flex: 'auto' }}
                                                type='text'
                                                name='externalDocumentId'
                                                className='form-control'
                                                placeholder='Enter external document ID'
                                                onChange={updateExternalReferens}
                                                disabled={CommonUtils.isNullEmptyOrUndefinedArray(
                                                    externalDocumentRefs
                                                )}
                                                value={
                                                    externalDocumentRefs ? (externalDocumentRefs[indexExternalDocumentRef]?.externalDocumentId ?? '') : ''
                                                }
                                            />
                                        </div>
                                        <div
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'row',
                                                marginBottom: '0.75rem',
                                            }}
                                        >
                                            <label className='sub-title lableSPDX' htmlFor='externalDocument'>
                                                External document
                                            </label>
                                            <input
                                                id='externalDocument'
                                                style={{ width: 'auto', flex: 'auto' }}
                                                type='text'
                                                name='spdxDocument'
                                                className='form-control'
                                                placeholder='Enter external document'
                                                onChange={updateExternalReferens}
                                                disabled={CommonUtils.isNullEmptyOrUndefinedArray(
                                                    externalDocumentRefs
                                                )}
                                                value={
                                                    externalDocumentRefs ? (externalDocumentRefs[indexExternalDocumentRef]?.spdxDocument ?? '') : ''
                                                }
                                            />
                                        </div>
                                        <div style={{ display: 'flex' }}>
                                            <label className='sub-title lableSPDX'>Checksum</label>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    flex: 7,
                                                }}
                                            >
                                                <div style={{ display: 'flex', marginBottom: '0.75rem' }}>
                                                    <input
                                                        style={{ flex: 2, marginRight: '1rem' }}
                                                        type='text'
                                                        className='form-control'
                                                        id='checksumAlgorithm'
                                                        name='algorithm'
                                                        placeholder='Enter algorithm'
                                                        onChange={updateCheckSum}
                                                        disabled={CommonUtils.isNullEmptyOrUndefinedArray(
                                                            externalDocumentRefs
                                                        )}
                                                        value={
                                                            externalDocumentRefs ? (externalDocumentRefs[indexExternalDocumentRef]?.checksum?.algorithm ?? '') : ''
                                                        }
                                                    />
                                                    <input
                                                        style={{ flex: 6 }}
                                                        type='text'
                                                        className='form-control'
                                                        id='checksumValue'
                                                        placeholder='Enter value'
                                                        name='checksumValue'
                                                        onChange={updateCheckSum}
                                                        disabled={CommonUtils.isNullEmptyOrUndefinedArray(
                                                            externalDocumentRefs
                                                        )}
                                                        value={
                                                            externalDocumentRefs ? (externalDocumentRefs[indexExternalDocumentRef]?.checksum?.checksumValue ?? '') : ''
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={3}>
                                    <div className='form-group'>
                                        <label className='lableSPDX' htmlFor='licenseListVersion'>
                                            6.7 License list version
                                        </label>
                                        <input
                                            id='licenseListVersion'
                                            name='licenseListVersion'
                                            className='form-control'
                                            type='text'
                                            placeholder='Enter license list version'
                                            onChange={updateField}
                                            value={documentCreationInformation.licenseListVersion ?? ''}
                                        />
                                    </div>
                                </td>
                            </tr>
                        </>
                    )}

                    <tr>
                        <td colSpan={3}>
                            <div className='form-group'>
                                <label className='lableSPDX' htmlFor='creator'>
                                    6.8 Creators
                                </label>
                                <div style={{ display: 'flex', flexDirection: 'column' }} id='spdx-creator'>
                                    <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0.75rem' }}>
                                        <label className='sub-title lableSPDX' htmlFor='creator-anonymous'>
                                            Anonymous
                                        </label>
                                        <input
                                            id='creator-anonymous'
                                            className='spdx-checkbox'
                                            type='checkbox'
                                            onChange={handleClickAnonymous}
                                        />
                                    </div>
                                    <div style={{ display: 'flex' }}>
                                        <label className='sub-title lableSPDX'>List</label>
                                        <Creators
                                            inputList={creator}
                                            setInputList={setCreator}
                                            isAnonymous={isAnonymous}
                                            setDataCreators={setDataCreators}
                                        />
                                    </div>
                                    <input
                                        id='spdxCreator'
                                        className='form-control'
                                        style={{ display: 'none' }}
                                        type='text'
                                    />

                                    {errorCreator && (
                                        <div>
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
                                        </div>
                                    )}
                                </div>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <Created
                            setCreated={setCreated}
                            dataCreated={dataCreated}
                            setDataCreated={setDataCreated}
                        />
                    </tr>
                    {isModeFull && (
                        <>
                            <tr>
                                <td colSpan={3}>
                                    <div className='form-group'>
                                        <label className='lableSPDX' htmlFor='creatorComment'>
                                            6.10 Creator comment
                                        </label>
                                        <textarea
                                            className='form-control'
                                            id='creatorComment'
                                            name='creatorComment'
                                            rows={5}
                                            placeholder='Enter creator comment'
                                            onChange={updateField}
                                            value={documentCreationInformation.creatorComment ?? ''}
                                        ></textarea>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={3}>
                                    <div className='form-group'>
                                        <label className='lableSPDX' htmlFor='documentComment'>
                                            6.11 Document comment
                                        </label>
                                        <textarea
                                            className='form-control'
                                            name='documentComment'
                                            id='documentComment'
                                            rows={5}
                                            onChange={updateField}
                                            placeholder='Enter document comment'
                                            value={documentCreationInformation.documentComment ?? ''}
                                        ></textarea>
                                    </div>
                                </td>
                            </tr>
                        </>
                    )}
                </>
            </tbody>
        </table>
    )
}

export default EditDocumentCreationInformation
