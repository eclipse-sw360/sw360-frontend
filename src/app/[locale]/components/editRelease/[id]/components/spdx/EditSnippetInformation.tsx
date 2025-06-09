// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import { InputKeyValue, SPDX, SPDXDocument, SnippetInformation, SnippetRange } from '@/object-types'
import CommonUtils from '@/utils/common.utils'
import { ReactNode, useEffect, useState } from 'react'
import { FaTrashAlt } from 'react-icons/fa'
import SnippetFileSPDXIdentifier from './SnippetInformation/SnippetFileSPDXIdentifier'
import SnippetRanges from './SnippetInformation/SnippetRanges'

interface Props {
    indexSnippetInformation: number
    setIndexSnippetInformation: React.Dispatch<React.SetStateAction<number>>
    snippetInformations: SnippetInformation[]
    setSnippetInformations: React.Dispatch<React.SetStateAction<SnippetInformation[]>>
    SPDXPayload: SPDX
    setSPDXPayload: React.Dispatch<React.SetStateAction<SPDX>>
}

const EditSnippetInformation = ({
    indexSnippetInformation,
    setIndexSnippetInformation,
    snippetInformations,
    setSnippetInformations,
    SPDXPayload,
    setSPDXPayload,
}: Props): ReactNode => {
    const [toggle, setToggle] = useState(false)
    const [snippetRanges, setSnippetRanges] = useState<SnippetRange[]>([])

    const [dataSnippetFromFile, setDataSnippetFromFile] = useState<InputKeyValue>({
        key: '',
        value: '',
    })

    const setDataSnippetRanges = (inputs: SnippetRange[]) => {
        const snippets: SnippetInformation[] = snippetInformations.map((snippet, index) => {
            if (index === indexSnippetInformation) {
                return {
                    ...snippet,
                    snippetRanges: inputs,
                }
            }
            return snippet
        })
        setSnippetInformations(snippets)
        setSPDXPayload({
            ...SPDXPayload,
            spdxDocument: {
                ...SPDXPayload.spdxDocument,
                snippets: snippets,
            } as SPDXDocument,
        })
    }

    const [increIndex, setIncreIndex] = useState(0)
    const [isAdd, setIsAdd] = useState(false)

    const displayIndex = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const index: string = e.target.value
        if (parseInt(index) === increIndex) {
            setIsAdd(true)
        } else {
            setIncreIndex(parseInt(index))
        }
        setIndexSnippetInformation(parseInt(index))

        if (snippetInformations[parseInt(index)]?.licenseConcluded === 'NONE') {
            setSnippetConcludedLicense('')
            setSnippetConcludedLicenseExist(false)
            setSnippetConcludedLicenseNone(true)
            setSnippetConcludedLicenseNoasserttion(false)
        } else if (snippetInformations[parseInt(index)]?.licenseConcluded === 'NOASSERTION') {
            setSnippetConcludedLicense('')
            setSnippetConcludedLicenseExist(false)
            setSnippetConcludedLicenseNone(false)
            setSnippetConcludedLicenseNoasserttion(true)
        } else {
            setSnippetConcludedLicense(snippetInformations[parseInt(index)]?.licenseConcluded)
            setSnippetConcludedLicenseExist(true)
            setSnippetConcludedLicenseNone(false)
            setSnippetConcludedLicenseNoasserttion(false)
        }

        if (snippetInformations[parseInt(index)]?.licenseInfoInSnippets.toString() === 'NONE') {
            setLicenseInfoInSnippets([])
            setLicenseInfoInSnippetsExist(false)
            setLicenseInfoInSnippetsNone(true)
            setLicenseInfoInSnippetsNoasserttion(false)
        } else if (snippetInformations[parseInt(index)]?.licenseInfoInSnippets.toString() === 'NOASSERTION') {
            setLicenseInfoInSnippets([])
            setLicenseInfoInSnippetsExist(false)
            setLicenseInfoInSnippetsNone(false)
            setLicenseInfoInSnippetsNoasserttion(true)
        } else {
            setLicenseInfoInSnippets(snippetInformations[parseInt(index)]?.licenseInfoInSnippets)
            setLicenseInfoInSnippetsExist(true)
            setLicenseInfoInSnippetsNone(false)
            setLicenseInfoInSnippetsNoasserttion(false)
        }

        if (snippetInformations[parseInt(index)]?.copyrightText === 'NONE') {
            setSnippetCopyrightText('')
            setSnippetCopyrightTextExist(false)
            setSnippetCopyrightTextNone(true)
            setSnippetCopyrightTextNoasserttion(false)
        } else if (snippetInformations[parseInt(index)]?.copyrightText === 'NOASSERTION') {
            setSnippetCopyrightText('')
            setSnippetCopyrightTextExist(false)
            setSnippetCopyrightTextNone(false)
            setSnippetCopyrightTextNoasserttion(true)
        } else {
            setSnippetCopyrightText(snippetInformations[parseInt(index)]?.copyrightText)
            setSnippetCopyrightTextExist(true)
            setSnippetCopyrightTextNone(false)
            setSnippetCopyrightTextNoasserttion(false)
        }

        setNumberIndex(parseInt(index))
        setDataSnippetFromFile({
            key: '',
            value: '',
        })
    }

    const addSnippet = () => {
        const arrayExternals: SnippetInformation[] = [...snippetInformations]
        setIncreIndex(snippetInformations.length)
        setNumberIndex(snippetInformations.length)
        setIsAdd(true)
        const snippetInformation: SnippetInformation = {
            SPDXID: '', // 9.1
            snippetFromFile: '', // 9.2
            snippetRanges: [], // 9.3, 9.4
            licenseConcluded: '', // 9.5
            licenseInfoInSnippets: [], // 9.6
            licenseComments: '', // 9.7
            copyrightText: '', // 9.8
            comment: '', // 9.9
            name: '', // 9.10
            snippetAttributionText: '', // 9.11
            index: snippetInformations.length,
        }
        setDataSnippetFromFile({
            key: '',
            value: '',
        })
        setIndexSnippetInformation(snippetInformations.length)
        //ConcludedLicense
        setSnippetConcludedLicenseExist(true)
        setSnippetConcludedLicenseNone(false)
        setSnippetConcludedLicenseNoasserttion(false)
        // licenseInfoInSnippets
        setLicenseInfoInSnippetsExist(true)
        setLicenseInfoInSnippetsNone(false)
        setLicenseInfoInSnippetsNoasserttion(false)
        //CopyrightText
        setSnippetCopyrightTextExist(true)
        setSnippetCopyrightTextNone(false)
        setSnippetCopyrightTextNoasserttion(false)

        arrayExternals.push(snippetInformation)
        setSnippetInformations(arrayExternals)
        setSPDXPayload({
            ...SPDXPayload,
            spdxDocument: {
                ...SPDXPayload.spdxDocument,
                snippets: arrayExternals,
            } as SPDXDocument,
        })
    }

    const [snippetConcludedLicense, setSnippetConcludedLicense] = useState('')
    const [snippetConcludedLicenseExist, setSnippetConcludedLicenseExist] = useState(true)
    const [snippetConcludedLicenseNone, setSnippetConcludedLicenseNone] = useState(false)
    const [snippetConcludedLicenseNoasserttion, setSnippetConcludedLicenseNoasserttion] = useState(false)

    const setSnippetConcludedLicenseToSnippet = (data: string) => {
        const snippets: SnippetInformation[] = snippetInformations.map((snippet, index) => {
            if (index === indexSnippetInformation) {
                return {
                    ...snippet,
                    licenseConcluded: data,
                }
            }
            return snippet
        })
        setSnippetInformations(snippets)
        setSPDXPayload({
            ...SPDXPayload,
            spdxDocument: {
                ...SPDXPayload.spdxDocument,
                snippets: snippets,
            } as SPDXDocument,
        })
    }

    const [snippetCopyrightText, setSnippetCopyrightText] = useState('')
    const [snippetCopyrightTextExist, setSnippetCopyrightTextExist] = useState(true)
    const [snippetCopyrightTextNone, setSnippetCopyrightTextNone] = useState(false)
    const [snippetCopyrightTextNoasserttion, setSnippetCopyrightTextNoasserttion] = useState(false)

    const setSnippetCopyrightTextToSnippet = (data: string) => {
        const snippets: SnippetInformation[] = snippetInformations.map((snippet, index) => {
            if (index === indexSnippetInformation) {
                return {
                    ...snippet,
                    copyrightText: data,
                }
            }
            return snippet
        })
        setSnippetInformations(snippets)
        setSPDXPayload({
            ...SPDXPayload,
            spdxDocument: {
                ...SPDXPayload.spdxDocument,
                snippets: snippets,
            } as SPDXDocument,
        })
    }

    useEffect(() => {
        if (typeof snippetInformations[indexSnippetInformation]?.snippetRanges !== 'undefined') {
            setSnippetRanges(convertSnippetRanges(snippetInformations[indexSnippetInformation].snippetRanges))
        }

        if (typeof snippetInformations[indexSnippetInformation]?.snippetFromFile !== 'undefined') {
            setDataSnippetFromFile(handleSnippetFromFile(snippetInformations[indexSnippetInformation].snippetFromFile))
        }

        if (typeof snippetInformations[indexSnippetInformation]?.licenseConcluded !== 'undefined') {
            if (snippetInformations[indexSnippetInformation]?.licenseConcluded === 'NONE') {
                // const data: string = snippetConcludedLicense
                setSnippetConcludedLicense('')
                setSnippetConcludedLicenseExist(false)
                setSnippetConcludedLicenseNone(true)
                setSnippetConcludedLicenseNoasserttion(false)
            } else if (snippetInformations[indexSnippetInformation]?.licenseConcluded === 'NOASSERTION') {
                // const data: string = snippetConcludedLicense
                setSnippetConcludedLicense('')
                setSnippetConcludedLicenseExist(false)
                setSnippetConcludedLicenseNone(false)
                setSnippetConcludedLicenseNoasserttion(true)
            } else {
                setSnippetConcludedLicense(snippetInformations[indexSnippetInformation]?.licenseConcluded)
            }
        }

        if (typeof snippetInformations[indexSnippetInformation]?.licenseInfoInSnippets !== 'undefined') {
            if (snippetInformations[indexSnippetInformation]?.licenseInfoInSnippets.toString() === 'NONE') {
                const data: string[] = licenseInfoInSnippets
                setLicenseInfoInSnippets(data)
                setLicenseInfoInSnippetsExist(false)
                setLicenseInfoInSnippetsNone(true)
                setLicenseInfoInSnippetsNoasserttion(false)
            } else if (
                snippetInformations[indexSnippetInformation]?.licenseInfoInSnippets.toString() === 'NOASSERTION'
            ) {
                const data: string[] = licenseInfoInSnippets
                setLicenseInfoInSnippets(data)
                setLicenseInfoInSnippetsExist(false)
                setLicenseInfoInSnippetsNone(false)
                setLicenseInfoInSnippetsNoasserttion(true)
            } else {
                setLicenseInfoInSnippets(snippetInformations[indexSnippetInformation]?.licenseInfoInSnippets)
            }
        }

        if (typeof snippetInformations[indexSnippetInformation]?.copyrightText !== 'undefined') {
            if (snippetInformations[indexSnippetInformation]?.copyrightText === 'NONE') {
                const data: string = snippetCopyrightText
                setSnippetCopyrightText(data)
                setSnippetCopyrightTextExist(false)
                setSnippetCopyrightTextNone(true)
                setSnippetCopyrightTextNoasserttion(false)
            } else if (snippetInformations[indexSnippetInformation]?.copyrightText === 'NOASSERTION') {
                const data: string = snippetCopyrightText
                setSnippetCopyrightText(data)
                setSnippetCopyrightTextExist(false)
                setSnippetCopyrightTextNone(false)
                setSnippetCopyrightTextNoasserttion(true)
            } else {
                setSnippetCopyrightText(snippetInformations[indexSnippetInformation]?.copyrightText)
            }
        }
    }, [indexSnippetInformation, snippetInformations])

    const convertSnippetRanges = (snippetRanges: SnippetRange[]) => {
        const inputs: SnippetRange[] = []
        snippetRanges.forEach((snippetRange: SnippetRange) => {
            const input: SnippetRange = {
                rangeType: snippetRange.rangeType,
                startPointer: snippetRange.startPointer,
                endPointer: snippetRange.endPointer,
                reference: snippetRange.reference,
                index: snippetRange.index,
            }
            inputs.push(input)
        })
        return inputs
    }

    const updateField = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
        const snippets: SnippetInformation[] = snippetInformations.map((snippet, index) => {
            if (index === indexSnippetInformation) {
                return {
                    ...snippet,
                    [e.target.name]:
                        e.target.name === 'licenseInfoInSnippets' ? e.target.value.split('\n') : e.target.value,
                }
            }
            return snippet
        })
        setSnippetInformations(snippets)
        setSPDXPayload({
            ...SPDXPayload,
            spdxDocument: {
                ...SPDXPayload.spdxDocument,
                snippets: snippets,
            } as SPDXDocument,
        })
    }

    const updateFieldSPDXIdentifier = (e: React.ChangeEvent<HTMLInputElement>) => {
        const snippets: SnippetInformation[] = snippetInformations.map((snippet, index) => {
            if (index === indexSnippetInformation) {
                return {
                    ...snippet,
                    [e.target.name]: 'SPDXRef-' + e.target.value,
                }
            }
            return snippet
        })
        setSnippetInformations(snippets)
        setSPDXPayload({
            ...SPDXPayload,
            spdxDocument: {
                ...SPDXPayload.spdxDocument,
                snippets: snippets,
            } as SPDXDocument,
        })
    }

    const [licenseInfoInSnippets, setLicenseInfoInSnippets] = useState<Array<string>>([])
    const [licenseInfoInSnippetsExist, setLicenseInfoInSnippetsExist] = useState(true)
    const [licenseInfoInSnippetsNone, setLicenseInfoInSnippetsNone] = useState(false)
    const [licenseInfoInSnippetsNoasserttion, setLicenseInfoInSnippetsNoasserttion] = useState(false)

    const setAllLicensesInformationToSnippet = (data: string | undefined | null) => {
        const snippets: SnippetInformation[] = snippetInformations.map((snippet, index) => {
            if (index === indexSnippetInformation) {
                return {
                    ...snippet,
                    licenseInfoInSnippets: CommonUtils.isNullEmptyOrUndefinedString(data) ? [] : data.split('\n'),
                }
            }
            return snippet
        })
        setSnippetInformations(snippets)
        setSPDXPayload({
            ...SPDXPayload,
            spdxDocument: {
                ...SPDXPayload.spdxDocument,
                snippets: snippets,
            } as SPDXDocument,
        })
    }

    const handleInputKeyToSnippetFromFile = (data: InputKeyValue) => {
        return data.key + '-' + data.value
    }
    const setSnippetFromFileToSnippet = (input: InputKeyValue) => {
        if (input.key === '') {
            input.key = 'SPDXRef'
        }
        const snippets: SnippetInformation[] = snippetInformations.map((snippet, index) => {
            if (index === indexSnippetInformation) {
                return {
                    ...snippet,
                    snippetFromFile: handleInputKeyToSnippetFromFile(input),
                }
            }
            return snippet
        })
        setSnippetInformations(snippets)
        setSPDXPayload({
            ...SPDXPayload,
            spdxDocument: {
                ...SPDXPayload.spdxDocument,
                snippets: snippets,
            } as SPDXDocument,
        })
    }

    const handleSnippetFromFile = (data: string | undefined | null) => {
        if (CommonUtils.isNullOrUndefined(data)) {
            const input: InputKeyValue = {
                key: '',
                value: '',
            }
            return input
        }
        const input: InputKeyValue = {
            key: data.split('-')[0],
            value: data.split('-')[1],
        }
        return input
    }

    const [numberIndex, setNumberIndex] = useState<number>(0)
    const [isDeleteSucces, setIsDeleteSucces] = useState(false)
    const deleteSnippetInformations = () => {
        if (snippetInformations.length == 1) {
            setSnippetInformations([])
            setSPDXPayload({
                ...SPDXPayload,
                spdxDocument: {
                    ...SPDXPayload.spdxDocument,
                    snippets: [],
                } as SPDXDocument,
            })
        } else {
            let snippetInformationDatas: SnippetInformation[] = []
            snippetInformationDatas = snippetInformations.filter(
                (snippetInformation) => numberIndex != snippetInformation.index,
            )
            setNumberIndex(indexSnippetInformation)
            for (let index = 0; index < snippetInformationDatas.length; index++) {
                snippetInformationDatas[index].index = index
            }
            setSnippetInformations(snippetInformationDatas)
            setIndexSnippetInformation(0)
            setIsDeleteSucces(true)
            setSPDXPayload({
                ...SPDXPayload,
                spdxDocument: {
                    ...SPDXPayload.spdxDocument,
                    snippets: snippetInformationDatas,
                } as SPDXDocument,
            })
            if (!CommonUtils.isNullEmptyOrUndefinedArray(snippetInformationDatas)) {
                setNumberIndex(snippetInformationDatas[0].index)
            }
        }
    }

    const selectLicenseInfoSnippetExist = () => {
        setLicenseInfoInSnippetsExist(true)
        setLicenseInfoInSnippetsNone(false)
        setLicenseInfoInSnippetsNoasserttion(false)
        setAllLicensesInformationToSnippet(licenseInfoInSnippets.toString())
    }
    const selectLicenseInfoSnippetNone = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLicenseInfoInSnippetsExist(false)
        setLicenseInfoInSnippetsNone(true)
        setLicenseInfoInSnippetsNoasserttion(false)
        setAllLicensesInformationToSnippet(e.target.value)
    }
    const selectLicenseInfoSnippetNoasserttion = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLicenseInfoInSnippetsExist(false)
        setLicenseInfoInSnippetsNone(false)
        setLicenseInfoInSnippetsNoasserttion(true)
        setAllLicensesInformationToSnippet(e.target.value)
    }

    const selectSnippetCopyrightTextExist = () => {
        setSnippetCopyrightTextExist(true)
        setSnippetCopyrightTextNone(false)
        setSnippetCopyrightTextNoasserttion(false)
        setSnippetCopyrightTextToSnippet(snippetCopyrightText)
    }
    const selectSnippetCopyrightTextNone = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSnippetCopyrightTextExist(false)
        setSnippetCopyrightTextNone(true)
        setSnippetCopyrightTextNoasserttion(false)
        setSnippetCopyrightTextToSnippet(e.target.value)
    }
    const selectSnippetCopyrightTextNoasserttion = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSnippetCopyrightTextExist(false)
        setSnippetCopyrightTextNone(false)
        setSnippetCopyrightTextNoasserttion(true)
        setSnippetCopyrightTextToSnippet(e.target.value)
    }

    const selectSnippetConcludedLicenseExist = () => {
        setSnippetConcludedLicenseExist(true)
        setSnippetConcludedLicenseNone(false)
        setSnippetConcludedLicenseNoasserttion(false)
        setSnippetConcludedLicenseToSnippet(snippetConcludedLicense)
    }
    const selectSnippetConcludedLicenseNone = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSnippetConcludedLicenseExist(false)
        setSnippetConcludedLicenseNone(true)
        setSnippetConcludedLicenseNoasserttion(false)
        setSnippetConcludedLicenseToSnippet(e.target.value)
    }
    const selectSnippetConcludedLicenseNoasserttion = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSnippetConcludedLicenseExist(false)
        setSnippetConcludedLicenseNone(false)
        setSnippetConcludedLicenseNoasserttion(true)
        setSnippetConcludedLicenseToSnippet(e.target.value)
    }

    const isNoneOrNoasserttionString = (data: string) => {
        if (data === 'NONE' || data === 'NOASSERTION') {
            return false
        }
        return true
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
                    <th colSpan={3}>9. Snippet Information</th>
                </tr>
            </thead>
            <tbody hidden={toggle}>
                <tr>
                    <td colSpan={3}>
                        <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0.75rem' }}>
                                <label
                                    htmlFor='selectSnippet'
                                    style={{ textDecoration: 'underline' }}
                                    className='sub-title lableSPDX'
                                >
                                    Select Snippet
                                </label>
                                <select
                                    id='selectSnippet'
                                    className='form-control spdx-select form-select'
                                    onChange={displayIndex}
                                    disabled={CommonUtils.isNullEmptyOrUndefinedArray(snippetInformations)}
                                    value={
                                        isAdd ? (isDeleteSucces ? indexSnippetInformation : increIndex) : numberIndex
                                    }
                                >
                                    {snippetInformations.map((item) => (
                                        <option
                                            key={item.index}
                                            value={item.index}
                                        >
                                            {item.index + 1}
                                        </option>
                                    ))}
                                </select>
                                <FaTrashAlt
                                    className='spdx-delete-icon-main-index'
                                    onClick={deleteSnippetInformations}
                                />
                            </div>
                            <button
                                className='spdx-add-button-main'
                                name='add-snippet'
                                onClick={addSnippet}
                            >
                                Add new Snippet
                            </button>
                        </div>
                    </td>
                </tr>
                {!CommonUtils.isNullOrUndefined(snippetInformations[indexSnippetInformation]) && (
                    <>
                        <tr>
                            <td style={{ width: '600px' }}>
                                <div
                                    className='form-group'
                                    style={{ flex: 1 }}
                                >
                                    <label
                                        className='lableSPDX'
                                        htmlFor='snippetSpdxIdentifier'
                                    >
                                        9.1 Snippet SPDX identifier
                                    </label>
                                    <div style={{ display: 'flex' }}>
                                        <label className='sub-label lableSPDX'>SPDXRef-</label>
                                        <input
                                            id='snippetSpdxIdentifier'
                                            className='form-control'
                                            type='text'
                                            placeholder='Enter snippet SPDX identifier'
                                            name='SPDXID'
                                            onChange={updateFieldSPDXIdentifier}
                                            value={
                                                CommonUtils.isNullEmptyOrUndefinedString(
                                                    snippetInformations[indexSnippetInformation].SPDXID,
                                                )
                                                    ? 'Snippet-'
                                                    : snippetInformations[indexSnippetInformation].SPDXID.startsWith(
                                                            'SPDXRef-',
                                                        )
                                                      ? snippetInformations[indexSnippetInformation].SPDXID.substring(8)
                                                      : snippetInformations[indexSnippetInformation].SPDXID
                                            }
                                        />
                                    </div>
                                </div>
                            </td>
                            <SnippetFileSPDXIdentifier
                                dataSnippetFromFile={dataSnippetFromFile}
                                setDataSnippetFromFile={setDataSnippetFromFile}
                                setSnippetFromFileToSnippet={setSnippetFromFileToSnippet}
                            />
                        </tr>
                        <tr>
                            <td colSpan={3}>
                                <div className='form-group'>
                                    <label className='lableSPDX'>9.3 & 9.4 Snippet ranges</label>
                                    <SnippetRanges
                                        inputList={snippetRanges}
                                        setInputList={setSnippetRanges}
                                        setDataSnippetRanges={setDataSnippetRanges}
                                    />
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={3}>
                                <div className='form-group'>
                                    <label className='lableSPDX'>9.5 Snippet concluded license</label>
                                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                                        <div style={{ display: 'inline-flex', flex: 3, marginRight: '1rem' }}>
                                            <input
                                                className='spdx-radio'
                                                id='spdxConcludedLicenseExist'
                                                type='radio'
                                                name='licenseConcluded'
                                                value='EXIST'
                                                onClick={selectSnippetConcludedLicenseExist}
                                                checked={snippetConcludedLicenseExist}
                                            />
                                            <input
                                                style={{ flex: 6, marginRight: '1rem' }}
                                                id='spdxConcludedLicenseValue'
                                                className='form-control'
                                                type='text'
                                                name='licenseConcluded'
                                                placeholder='Enter snippet concluded license'
                                                onChange={updateField}
                                                value={
                                                    isNoneOrNoasserttionString(
                                                        snippetInformations[indexSnippetInformation].licenseConcluded,
                                                    )
                                                        ? snippetInformations[indexSnippetInformation].licenseConcluded
                                                        : ''
                                                }
                                                disabled={
                                                    snippetConcludedLicenseNone || snippetConcludedLicenseNoasserttion
                                                }
                                            />
                                        </div>
                                        <div style={{ flex: 2 }}>
                                            <input
                                                className='spdx-radio'
                                                id='spdxConcludedLicenseNone'
                                                type='radio'
                                                name='licenseConcluded'
                                                value='NONE'
                                                onChange={selectSnippetConcludedLicenseNone}
                                                checked={snippetConcludedLicenseNone}
                                            />
                                            <label
                                                style={{ marginRight: '2rem' }}
                                                className='form-check-label radio-label lableSPDX'
                                                htmlFor='spdxConcludedLicenseNone'
                                            >
                                                NONE
                                            </label>
                                            <input
                                                className='spdx-radio'
                                                id='spdxConcludedLicenseNoAssertion'
                                                type='radio'
                                                name='licenseConcluded'
                                                value='NOASSERTION'
                                                onChange={selectSnippetConcludedLicenseNoasserttion}
                                                checked={snippetConcludedLicenseNoasserttion}
                                            />
                                            <label
                                                className='form-check-label radio-label lableSPDX'
                                                htmlFor='spdxConcludedLicenseNoAssertion'
                                            >
                                                NOASSERTION
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={3}>
                                <div className='form-group'>
                                    <label className='lableSPDX'>9.6 License information in snippet</label>
                                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                                        <div style={{ display: 'inline-flex', flex: 3, marginRight: '1rem' }}>
                                            <input
                                                className='spdx-radio'
                                                id='licenseInfoInFile'
                                                type='radio'
                                                name='licenseInfoInSnippets'
                                                value='EXIST'
                                                onClick={selectLicenseInfoSnippetExist}
                                                checked={licenseInfoInSnippetsExist}
                                            />
                                            <textarea
                                                style={{ flex: 6, marginRight: '1rem' }}
                                                id='licenseInfoInFileValue'
                                                rows={5}
                                                className='form-control'
                                                name='licenseInfoInSnippets'
                                                placeholder='Enter license information in snippet'
                                                onChange={updateField}
                                                value={snippetInformations[
                                                    indexSnippetInformation
                                                ].licenseInfoInSnippets
                                                    .toString()
                                                    .replaceAll(',', '\n')}
                                                disabled={
                                                    licenseInfoInSnippetsNone || licenseInfoInSnippetsNoasserttion
                                                }
                                            ></textarea>
                                        </div>
                                        <div style={{ flex: 2 }}>
                                            <input
                                                className='spdx-radio'
                                                id='licenseInfoInFileNone'
                                                type='radio'
                                                name='licenseInfoInSnippets'
                                                value='NONE'
                                                onChange={selectLicenseInfoSnippetNone}
                                                checked={licenseInfoInSnippetsNone}
                                            />
                                            <label
                                                style={{ marginRight: '2rem' }}
                                                className='form-check-label radio-label lableSPDX'
                                                htmlFor='licenseInfoInFileNone'
                                            >
                                                NONE
                                            </label>
                                            <input
                                                className='spdx-radio'
                                                id='licenseInfoInFileNoAssertion'
                                                type='radio'
                                                name='licenseInfoInSnippets'
                                                value='NOASSERTION'
                                                onChange={selectLicenseInfoSnippetNoasserttion}
                                                checked={licenseInfoInSnippetsNoasserttion}
                                            />
                                            <label
                                                className='form-check-label radio-label lableSPDX'
                                                htmlFor='licenseInfoInFileNoAssertion'
                                            >
                                                NOASSERTION
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={3}>
                                <div className='form-group'>
                                    <label
                                        className='lableSPDX'
                                        htmlFor='snippetLicenseComments'
                                    >
                                        9.7 Snippet comments on license
                                    </label>
                                    <textarea
                                        className='form-control'
                                        id='snippetLicenseComments'
                                        rows={5}
                                        placeholder='Enter snippet comments on license'
                                        name='licenseComments'
                                        onChange={updateField}
                                        value={snippetInformations[indexSnippetInformation].licenseComments}
                                    ></textarea>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={3}>
                                <div className='form-group'>
                                    <label className='lableSPDX'>9.8 Snippet copyright text</label>
                                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                                        <div style={{ display: 'inline-flex', flex: 3, marginRight: '1rem' }}>
                                            <input
                                                className='spdx-radio'
                                                id='snippetCopyrightText'
                                                type='radio'
                                                name='_sw360_portlet_components_SNIPPET_COPYRIGHT_TEXT'
                                                value='EXIST'
                                                onClick={selectSnippetCopyrightTextExist}
                                                checked={snippetCopyrightTextExist}
                                            />
                                            <textarea
                                                style={{ flex: 6, marginRight: '1rem' }}
                                                id='copyrightTextValueSnippet'
                                                rows={5}
                                                className='form-control'
                                                name='copyrightText'
                                                placeholder='Enter snippet copyright text'
                                                onChange={updateField}
                                                value={snippetInformations[indexSnippetInformation].copyrightText}
                                                disabled={snippetCopyrightTextNone || snippetCopyrightTextNoasserttion}
                                            ></textarea>
                                        </div>
                                        <div style={{ flex: 2 }}>
                                            <input
                                                className='spdx-radio'
                                                id='snippetCopyrightTextNone'
                                                type='radio'
                                                name='copyrightText'
                                                value='NONE'
                                                onChange={selectSnippetCopyrightTextNone}
                                                checked={snippetCopyrightTextNone}
                                            />
                                            <label
                                                style={{ marginRight: '2rem' }}
                                                className='form-check-label radio-label lableSPDX'
                                                htmlFor='snippetCopyrightTextNone'
                                            >
                                                NONE
                                            </label>
                                            <input
                                                className='spdx-radio'
                                                id='snippetCopyrightTextNoAssertion'
                                                type='radio'
                                                name='copyrightText'
                                                value='NOASSERTION'
                                                onChange={selectSnippetCopyrightTextNoasserttion}
                                                checked={snippetCopyrightTextNoasserttion}
                                            />
                                            <label
                                                className='form-check-label radio-label lableSPDX'
                                                htmlFor='snippetCopyrightTextNoAssertion'
                                            >
                                                NOASSERTION
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={3}>
                                <div className='form-group'>
                                    <label
                                        className='lableSPDX'
                                        htmlFor='snippetComment'
                                    >
                                        9.9 Snippet comment
                                    </label>
                                    <textarea
                                        className='form-control'
                                        id='snippetComment'
                                        rows={5}
                                        placeholder='Enter snippet comment'
                                        name='comment'
                                        onChange={updateField}
                                        value={snippetInformations[indexSnippetInformation].comment}
                                    ></textarea>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={3}>
                                <div className='form-group'>
                                    <label
                                        className='lableSPDX'
                                        htmlFor='snippetName'
                                    >
                                        9.10 Snippet name
                                    </label>
                                    <input
                                        id='snippetName'
                                        type='text'
                                        className='form-control'
                                        placeholder='Enter snippet name'
                                        name='name'
                                        onChange={updateField}
                                        value={snippetInformations[indexSnippetInformation].name}
                                    />
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={3}>
                                <div className='form-group'>
                                    <label
                                        className='lableSPDX'
                                        htmlFor='snippetAttributionText'
                                    >
                                        9.11 Snippet attribution text
                                    </label>
                                    <textarea
                                        className='form-control'
                                        id='snippetAttributionText'
                                        rows={5}
                                        placeholder='Enter snippet attribution text'
                                        name='snippetAttributionText'
                                        onChange={updateField}
                                        value={snippetInformations[indexSnippetInformation].snippetAttributionText}
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

export default EditSnippetInformation
