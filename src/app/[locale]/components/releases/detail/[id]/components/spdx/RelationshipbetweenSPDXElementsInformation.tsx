// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import { RelationshipsBetweenSPDXElements } from '@/object-types'
import CommonUtils from '@/utils/common.utils'
import { useState } from 'react'
import styles from '../../detail.module.css'

interface Props {
    relationshipSelection?: { index: number; isSPDXDocument: boolean }
    setRelationshipSelection?: React.Dispatch<React.SetStateAction<{ index: number; isSPDXDocument: boolean }>>
    relationshipsBetweenSPDXElementSPDXs: RelationshipsBetweenSPDXElements[]
    setRelationshipsBetweenSPDXElementSPDXs: React.Dispatch<React.SetStateAction<RelationshipsBetweenSPDXElements[]>>
    relationshipsBetweenSPDXElementPackages: RelationshipsBetweenSPDXElements[]
    setRelationshipsBetweenSPDXElementPackages: React.Dispatch<React.SetStateAction<RelationshipsBetweenSPDXElements[]>>
}

const RelationshipbetweenSPDXElementsInformation = ({
    relationshipSelection,
    setRelationshipSelection,
    relationshipsBetweenSPDXElementSPDXs,
    setRelationshipsBetweenSPDXElementSPDXs,
    relationshipsBetweenSPDXElementPackages,
    setRelationshipsBetweenSPDXElementPackages,
}: Props) => {
    const [toggle, setToggle] = useState(false)
    const [changeSource, setChangeSource] = useState(false)

    const changeRelationshipSource = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setChangeSource(true)
        const relationshipType: string = e.target.value
        if (relationshipType === 'spdxDoucument') {
            setRelationshipSelection({
                index: 0,
                isSPDXDocument: true,
            })
            if (!CommonUtils.isNullEmptyOrUndefinedArray(relationshipsBetweenSPDXElementSPDXs)) {
                setRelationshipsBetweenSPDXElementSPDXs(relationshipsBetweenSPDXElementSPDXs)
            } else {
                setRelationshipsBetweenSPDXElementSPDXs([])
            }
        } else if (relationshipType === 'package') {
            setRelationshipSelection({
                index: 0,
                isSPDXDocument: false,
            })
            if (!CommonUtils.isNullEmptyOrUndefinedArray(relationshipsBetweenSPDXElementPackages)) {
                setRelationshipsBetweenSPDXElementPackages(relationshipsBetweenSPDXElementPackages)
            } else {
                setRelationshipsBetweenSPDXElementPackages([])
            }
        }
    }

    const displayIndex = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setChangeSource(false)
        const index: string = e.target.value
        setRelationshipSelection({
            ...relationshipSelection,
            index: parseInt(index),
        })
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
                    <th colSpan={2}>11. Relationship between SPDX Elements Information</th>
                </tr>
            </thead>
            <tbody hidden={toggle}>
                <tr>
                    <td className='spdx-label-index'>Source</td>
                    <td className='spdx-flex-row' style={{ height: '50.5px' }}>
                        <select
                            id='relationshipSourceSelect'
                            className='spdx-col-2'
                            onChange={changeRelationshipSource}
                        >
                            <option value='spdxDoucument' selected={relationshipSelection.isSPDXDocument}>
                                SPDX Document
                            </option>
                            <option value='package' selected={!relationshipSelection.isSPDXDocument}>
                                Package
                            </option>
                        </select>
                    </td>
                </tr>
                <tr>
                    <td className='spdx-label-index'>Index</td>
                    <td style={{ height: '50.5px' }}>
                        <select
                            id='relationshipSelect'
                            className='spdx-col-2'
                            onChange={displayIndex}
                            style={{ width: '100%' }}
                            value={changeSource ? 0 : relationshipSelection.index}
                            disabled={
                                relationshipSelection.isSPDXDocument
                                    ? CommonUtils.isNullEmptyOrUndefinedArray(relationshipsBetweenSPDXElementSPDXs)
                                    : CommonUtils.isNullEmptyOrUndefinedArray(relationshipsBetweenSPDXElementPackages)
                            }
                        >
                            {relationshipSelection.isSPDXDocument
                                ? relationshipsBetweenSPDXElementSPDXs.map((item) => (
                                      <option
                                          key={item.index}
                                          value={item.index}
                                          selected={item.index === relationshipSelection.index}
                                      >
                                          {item.index + 1}
                                      </option>
                                  ))
                                : relationshipsBetweenSPDXElementPackages.map((item) => (
                                      <option
                                          key={item.index}
                                          value={item.index}
                                          selected={item.index === relationshipSelection.index}
                                      >
                                          {item.index + 1}
                                      </option>
                                  ))}
                        </select>
                    </td>
                </tr>

                {(relationshipSelection.isSPDXDocument
                    ? relationshipsBetweenSPDXElementSPDXs[relationshipSelection.index]
                    : relationshipsBetweenSPDXElementPackages[relationshipSelection.index]) && (
                    <>
                        <tr className='relationship-document'>
                            <td>11.1 Relationship</td>
                            <td>
                                <div className='spdx-col-2 spdx-flex-col'>
                                    <div className='spdx-flex-row'>
                                        <div className='spdx-col-1 '>
                                            {relationshipSelection.isSPDXDocument
                                                ? relationshipsBetweenSPDXElementSPDXs[relationshipSelection.index]
                                                      ?.spdxElementId
                                                : relationshipsBetweenSPDXElementPackages[relationshipSelection.index]
                                                      ?.spdxElementId ?? ''}
                                        </div>
                                        <div className='spdx-col-1 spdx-flex-row'>
                                            {relationshipSelection.isSPDXDocument
                                                ? relationshipsBetweenSPDXElementSPDXs[relationshipSelection.index]
                                                      ?.relationshipType
                                                : relationshipsBetweenSPDXElementPackages[
                                                      relationshipSelection.index
                                                  ]?.relationshipType.replace('relationshipType_', '') ?? ''}
                                        </div>
                                        <div className='spdx-col-3'>
                                            {relationshipSelection.isSPDXDocument
                                                ? relationshipsBetweenSPDXElementSPDXs[relationshipSelection.index]
                                                      ?.relatedSpdxElement
                                                : relationshipsBetweenSPDXElementPackages[relationshipSelection.index]
                                                      ?.relatedSpdxElement ?? ''}
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr className='relationship-document'>
                            <td>11.2 Relationship comment</td>
                            <td>
                                <p className='spdx-col-2'>
                                    {relationshipSelection.isSPDXDocument
                                        ? relationshipsBetweenSPDXElementSPDXs[
                                              relationshipSelection.index
                                          ]?.relationshipComment
                                              .trim()
                                              .split('\n')
                                              .map((item) => {
                                                  return (
                                                      <>
                                                          {item}
                                                          <br></br>
                                                      </>
                                                  )
                                              })
                                        : relationshipsBetweenSPDXElementPackages[
                                              relationshipSelection.index
                                          ]?.relationshipComment
                                              .trim()
                                              .split('\n')
                                              .map((item) => {
                                                  return (
                                                      <>
                                                          {item}
                                                          <br></br>
                                                      </>
                                                  )
                                              }) ?? ''}
                                </p>
                            </td>
                        </tr>
                    </>
                )}
            </tbody>
        </table>
    )
}

export default RelationshipbetweenSPDXElementsInformation
