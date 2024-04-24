// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import { SPDXDocument, SnippetInformation, SnippetRange } from '@/object-types'
import { useState } from 'react'
import styles from '../../detail.module.css'

interface Props {
    spdxDocument?: SPDXDocument
    indexSnippetInformation?: number
    setIndexSnippetInformation?: React.Dispatch<React.SetStateAction<number>>
    snippetInformations?: SnippetInformation[]
    setSnippetRanges?: React.Dispatch<React.SetStateAction<SnippetRange[]>>
    snippetRanges?: SnippetRange[]
}

const SnippetInformationDetail = ({
    spdxDocument,
    indexSnippetInformation,
    setIndexSnippetInformation,
    snippetInformations,
    setSnippetRanges,
    snippetRanges,
}: Props) => {
    const [toggle, setToggle] = useState(false)

    const displayIndex = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const index: string = e.target.value
        setIndexSnippetInformation(parseInt(index))
        setSnippetRanges(snippetInformations[parseInt(index)].snippetRanges)
    }

    return (
        <table className={`table label-value-table ${styles['summary-table']}`}>
            <thead
                title='Click to expand or collapse'
                onClick={() => {
                    setToggle(!toggle)
                }}
            >
                <tr>
                    <th colSpan={2}>9. Snippet Information</th>
                </tr>
            </thead>
            <tbody hidden={toggle}>
                <tr>
                    <td className='spdx-label-index'>Index</td>
                    <td>
                        <select
                            id='snippetInfoSelect'
                            className='spdx-col-2'
                            onChange={displayIndex}
                            style={{ width: '100%' }}
                            disabled={spdxDocument?.snippets.length == 0}
                        >
                            {spdxDocument?.snippets
                                .toSorted((e1, e2) => e1.index - e2.index)
                                .map((item) => (
                                    <option key={item.index} value={item.index}>
                                        {item.index + 1}
                                    </option>
                                ))}
                        </select>
                    </td>
                </tr>
                {snippetInformations[indexSnippetInformation] && (
                    <>
                        <tr data-index={snippetInformations[indexSnippetInformation].index}>
                            <td>9.1 Snippet SPDX identifier</td>
                            <td>{snippetInformations[indexSnippetInformation].SPDXID}</td>
                        </tr>
                        <tr data-index={snippetInformations[indexSnippetInformation].index}>
                            <td>9.2 Snippet from file SPDX identifier</td>
                            <td>{snippetInformations[indexSnippetInformation].snippetFromFile}</td>
                        </tr>
                        <tr data-index={snippetInformations[indexSnippetInformation].index}>
                            <td>9.3 & 9.4 Snippet ranges</td>
                            <td>
                                <div
                                    className='spdx-col-2 spdx-flex-col'
                                    id={`snippetLicenseComments-${snippetInformations[indexSnippetInformation].index}`}
                                >
                                    {snippetRanges.map((snippetRangeData, index) => {
                                        return (
                                            <div key={index} className='spdx-flex-row' data-index={index}>
                                                <div className='spdx-col-1 spdx-key'>{snippetRangeData.rangeType}</div>
                                                <div className='spdx-col-1' style={{ display: 'flex' }}>
                                                    <div className='spdx-col-1'>{snippetRangeData.startPointer}</div>
                                                    <div className='spdx-col-1'>~</div>
                                                    <div className='spdx-col-1'>{snippetRangeData.endPointer}</div>
                                                </div>
                                                <div className='spdx-col-3'>{snippetRangeData.reference}</div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </td>
                        </tr>
                        <tr data-index={snippetInformations[indexSnippetInformation].index}>
                            <td>9.5 Snippet concluded license</td>
                            <td>{snippetInformations[indexSnippetInformation].licenseConcluded}</td>
                        </tr>
                        <tr data-index={snippetInformations[indexSnippetInformation].index}>
                            <td>9.6 License information in snippet</td>
                            <td>
                                <p className='spdx-col-2 '>
                                    {snippetInformations[indexSnippetInformation]?.licenseInfoInSnippets.map(
                                        (licenseInfoInSnippetData) => {
                                            return (
                                                <>
                                                    {licenseInfoInSnippetData}
                                                    <br></br>
                                                </>
                                            )
                                        }
                                    )}
                                </p>
                            </td>
                        </tr>
                        <tr data-index={snippetInformations[indexSnippetInformation].index}>
                            <td>9.7 Snippet comments on license</td>
                            <td>
                                <p
                                    className='spdx-col-2 '
                                    id={`snippetLicenseComments-${snippetInformations[indexSnippetInformation].index}`}
                                >
                                    {snippetInformations[indexSnippetInformation]?.licenseComments
                                        .trim()
                                        .split('\n')
                                        .map((item) => {
                                            return (
                                                <>
                                                    {item}
                                                    <br></br>
                                                </>
                                            )
                                        })}
                                </p>
                            </td>
                        </tr>
                        <tr data-index={snippetInformations[indexSnippetInformation].index}>
                            <td>9.8 Snippet copyright text</td>
                            <td>
                                <p
                                    className='spdx-col-2 '
                                    id={`snippetLicenseComments-${snippetInformations[indexSnippetInformation].index}`}
                                >
                                    {snippetInformations[indexSnippetInformation]?.copyrightText
                                        .trim()
                                        .split('\n')
                                        .map((item) => {
                                            return (
                                                <>
                                                    {item}
                                                    <br></br>
                                                </>
                                            )
                                        })}
                                </p>
                            </td>
                        </tr>
                        <tr data-index={snippetInformations[indexSnippetInformation].index}>
                            <td>9.9 Snippet comment</td>
                            <td>
                                <p
                                    className='spdx-col-2 '
                                    id={`snippetLicenseComments-${snippetInformations[indexSnippetInformation].index}`}
                                >
                                    {snippetInformations[indexSnippetInformation]?.comment
                                        .trim()
                                        .split('\n')
                                        .map((item) => {
                                            return (
                                                <>
                                                    {item}
                                                    <br></br>
                                                </>
                                            )
                                        })}
                                </p>
                            </td>
                        </tr>
                        <tr data-index={snippetInformations[indexSnippetInformation].index}>
                            <td>9.10 Snippet name</td>
                            <td>
                                <p className='spdx-col-2 '>{snippetInformations[indexSnippetInformation]?.name}</p>
                            </td>
                        </tr>
                        <tr data-index={snippetInformations[indexSnippetInformation].index}>
                            <td>9.11 Snippet attribution text</td>
                            <td>
                                <p
                                    className='spdx-col-2 '
                                    id={`snippetLicenseComments-${snippetInformations[indexSnippetInformation].index}`}
                                >
                                    {snippetInformations[indexSnippetInformation]?.snippetAttributionText
                                        .trim()
                                        .split('\n')
                                        .map((item) => {
                                            return (
                                                <>
                                                    {item}
                                                    <br></br>
                                                </>
                                            )
                                        })}
                                </p>
                            </td>
                        </tr>
                    </>
                )}
            </tbody>
        </table>
    )
}

export default SnippetInformationDetail
