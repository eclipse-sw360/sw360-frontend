// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import { DocumentCreationInformation, ExternalDocumentReferences } from '@/object-types'
import { ReactNode, useState } from 'react'
import { CommonUtils } from '@/utils'

interface Props {
    documentCreationInformation?: DocumentCreationInformation
    externalDocumentRef?: ExternalDocumentReferences
    setExternalDocumentRef: React.Dispatch<React.SetStateAction<ExternalDocumentReferences | undefined>>
    isModeFull: boolean
}

const DocumentCreationInformationDetail = ({
    documentCreationInformation,
    externalDocumentRef,
    setExternalDocumentRef,
    isModeFull,
}: Props) : ReactNode => {
    const [toggle, setToggle] = useState(false)

    const displayIndex = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (!documentCreationInformation) return
        const index: string = e.target.value
        setExternalDocumentRef(
            documentCreationInformation.externalDocumentRefs
            ? documentCreationInformation.externalDocumentRefs[parseInt(index)]
            : undefined
        )
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
                    <th colSpan={2}>6. Document Creation Information</th>
                </tr>
            </thead>
            <tbody hidden={toggle}>
                <tr>
                    <td>6.1 SPDX version</td>
                    <td>{documentCreationInformation?.spdxVersion}</td>
                </tr>
                <tr>
                    <td>6.2 Data license</td>
                    <td>{documentCreationInformation?.dataLicense}</td>
                </tr>
                <tr>
                    <td>6.3 SPDX identifier</td>
                    <td>{documentCreationInformation?.SPDXID}</td>
                </tr>
                <tr>
                    <td>6.4 Document name</td>
                    <td>{documentCreationInformation?.name}</td>
                </tr>
                <tr>
                    <td>6.5 SPDX document namespace</td>
                    <td>{documentCreationInformation?.documentNamespace}</td>
                </tr>

                {isModeFull && (
                    <>
                        <tr className='spdx-full'>
                            <td>6.6 External document references</td>
                            <td>
                                <div className='spdx-col-2 section' data-size='3'>
                                    <div className='spdx-flex-row'>
                                        <div className='spdx-col-1 spdx-label-index'>Index</div>
                                        <select
                                            className='spdx-col-3'
                                            id='externalDocumentRefs'
                                            onChange={displayIndex}
                                            disabled={documentCreationInformation?.externalDocumentRefs?.length == 0}
                                        >
                                            {
                                            (documentCreationInformation && documentCreationInformation.externalDocumentRefs)
                                            &&
                                            documentCreationInformation.externalDocumentRefs
                                                .toSorted((e1, e2) => e1.index - e2.index)
                                                .map((item) => (
                                                    <option key={item.index} value={item.index}>
                                                        {item.index + 1}
                                                    </option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                    {externalDocumentRef && (
                                        <>
                                            <div className='spdx-flex-row'>
                                                <div className='spdx-col-1 spdx-key'>External document ID</div>
                                                <div className='spdx-col-3'>
                                                    {externalDocumentRef.externalDocumentId}
                                                </div>
                                            </div>
                                            <div className='spdx-flex-row'>
                                                <div className='spdx-col-1 spdx-key'>External document</div>
                                                <div className='spdx-col-3'>{externalDocumentRef.spdxDocument}</div>
                                            </div>
                                            <div className='spdx-flex-row'>
                                                <div className='spdx-col-2 spdx-key'>Checksum</div>
                                                <div className='spdx-col-3'>
                                                    {externalDocumentRef.checksum.algorithm} :{' '}
                                                    {externalDocumentRef.checksum.checksumValue}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </td>
                        </tr>

                        <tr className='spdx-full'>
                            <td>6.7 License list version</td>
                            <td>{documentCreationInformation?.licenseListVersion}</td>
                        </tr>
                    </>
                )}
                <tr>
                    <td>6.8 Creators</td>
                    <td>
                        <div className='spdx-col-2' id='creators'>
                            {
                                (documentCreationInformation && documentCreationInformation.creator)
                                    && documentCreationInformation.creator
                                    .toSorted((e1, e2) => e1.index - e2.index)
                                    .map((creatorData) => {
                                        return (
                                            <div
                                                key={creatorData.index}
                                                className='spdx-flex-row creator'
                                                data-index={creatorData.index}
                                            >
                                                <div className='spdx-col-1 spdx-key'>{creatorData.type}</div>
                                                <div className='spdx-col-3'>{creatorData.value}</div>
                                            </div>
                                        )
                                    })
                            }
                        </div>
                    </td>
                </tr>
                <tr className='spdx-full'>
                    <td>6.9 Created</td>
                    <td>{documentCreationInformation?.created}</td>
                </tr>
                {isModeFull && (
                    <>
                        <tr className='spdx-full'>
                            <td>6.10 Creator comment</td>
                            <td>
                                {(documentCreationInformation&& !CommonUtils.isNullEmptyOrUndefinedString(documentCreationInformation.creatorComment))
                                && documentCreationInformation.creatorComment
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
                            </td>
                        </tr>
                        <tr className='spdx-full'>
                            <td>6.11 Document comment</td>
                            <td>
                                {
                                (documentCreationInformation && !CommonUtils.isNullEmptyOrUndefinedString(documentCreationInformation.documentComment))
                                &&
                                documentCreationInformation.documentComment
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
                            </td>
                        </tr>
                    </>
                )}
            </tbody>
        </table>
    )
}

export default DocumentCreationInformationDetail
