// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import { Annotations } from '@/object-types'
import CommonUtils from '@/utils/common.utils'
import { useState } from 'react'
import styles from '../../detail.module.css'

interface Props {
    indexAnnotations?: number
    setIndexAnnotations?: React.Dispatch<React.SetStateAction<number>>
    annotationsSPDXs?: Annotations[]
    setAnnotationsSPDXs?: React.Dispatch<React.SetStateAction<Annotations[]>>
    annotationsPackages?: Annotations[]
    setAnnotationsPackages?: React.Dispatch<React.SetStateAction<Annotations[]>>
}

const AnnotationInformation = ({
    indexAnnotations,
    setIndexAnnotations,
    annotationsSPDXs,
    setAnnotationsSPDXs,
    annotationsPackages,
    setAnnotationsPackages,
}: Props) => {
    const [toggle, setToggle] = useState(false)
    const [changeSource, setChangeSource] = useState(false)
    const [isSourceSPDXDocument, setIsSourceSPDXDocument] = useState<boolean>(true)

    const changeAnnotationSource = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setChangeSource(true)
        setIndexAnnotations(0)
        const relationshipType: string = e.target.value
        if (relationshipType === 'spdxDoucument') {
            setIsSourceSPDXDocument(true)
            if (!CommonUtils.isNullEmptyOrUndefinedArray(annotationsSPDXs)) {
                setAnnotationsSPDXs(annotationsSPDXs)
            } else {
                setAnnotationsSPDXs([])
            }
        } else if (relationshipType === 'package') {
            setIsSourceSPDXDocument(false)
            if (!CommonUtils.isNullEmptyOrUndefinedArray(annotationsPackages)) {
                setAnnotationsPackages(annotationsPackages)
            } else {
                setAnnotationsPackages([])
            }
        }
    }

    const displayIndex = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const index: string = e.target.value
        setIndexAnnotations(parseInt(index))
        setChangeSource(false)
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
                    <th colSpan={2}>12. Annotation Information</th>
                </tr>
            </thead>
            <tbody hidden={toggle}>
                <tr>
                    <td className='spdx-label-index'>Source</td>
                    <td style={{ height: '50px' }}>
                        <select
                            id='annotationSourceSelect'
                            className='spdx-col-2'
                            onChange={changeAnnotationSource}
                            style={{ width: '100%' }}
                        >
                            <option value='spdxDoucument'>SPDX Document</option>
                            <option value='package'>Package</option>
                        </select>
                    </td>
                </tr>
                <tr>
                    <td className='spdx-label-index'>Index</td>
                    <td style={{ height: '50px' }}>
                        <select
                            id='annotationSelect'
                            className='spdx-col-2'
                            onChange={displayIndex}
                            style={{ width: '100%' }}
                            value={changeSource ? 0 : indexAnnotations}
                            disabled={
                                isSourceSPDXDocument
                                    ? CommonUtils.isNullEmptyOrUndefinedArray(annotationsSPDXs)
                                    : CommonUtils.isNullEmptyOrUndefinedArray(annotationsPackages)
                            }
                        >
                            {isSourceSPDXDocument
                                ? annotationsSPDXs.map((item) => (
                                      <option key={item.index} value={item.index}>
                                          {item.index + 1}
                                      </option>
                                  ))
                                : annotationsPackages.map((item) => (
                                      <option key={item.index} value={item.index}>
                                          {item.index + 1}
                                      </option>
                                  ))}
                        </select>
                    </td>
                </tr>

                {(isSourceSPDXDocument
                    ? annotationsSPDXs[indexAnnotations]
                    : annotationsPackages[indexAnnotations]) && (
                    <>
                        <tr className='annotation-document'>
                            <td>12.1 Annotator</td>
                            <td>
                                <p className='spdx-col-2 '>
                                    {isSourceSPDXDocument
                                        ? annotationsSPDXs[indexAnnotations]?.annotator
                                        : annotationsPackages[indexAnnotations]?.annotator ?? ''}
                                </p>
                            </td>
                        </tr>
                        <tr className='annotation-document'>
                            <td>12.2 Annotation date</td>
                            <td>
                                <p className='spdx-col-2 ' id='annotation-document-date-${loop.count}'>
                                    {isSourceSPDXDocument
                                        ? annotationsSPDXs[indexAnnotations]?.annotationDate
                                        : annotationsPackages[indexAnnotations]?.annotationDate ?? ''}
                                </p>
                            </td>
                        </tr>
                        <tr className='annotation-document'>
                            <td>12.3 Annotation type</td>
                            <td>
                                <div className='spdx-col-2'>
                                    <div className='spdx-flex-row'>
                                        <div className='spdx-col-3'>
                                            {isSourceSPDXDocument
                                                ? annotationsSPDXs[indexAnnotations]?.annotationType
                                                : annotationsPackages[indexAnnotations]?.annotationType ?? ''}
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr className='annotation-document'>
                            <td>12.4 SPDX identifier reference</td>
                            <td>
                                {isSourceSPDXDocument
                                    ? annotationsSPDXs[indexAnnotations]?.spdxIdRef
                                    : annotationsPackages[indexAnnotations]?.spdxIdRef ?? ''}
                            </td>
                        </tr>
                        <tr className='annotation-document'>
                            <td>12.5 Annotation comment</td>
                            <td>
                                <p className='spdx-col-2 ' id='documentAnnotationComment-${annotations.index}'>
                                    {isSourceSPDXDocument
                                        ? annotationsSPDXs[indexAnnotations]?.annotationComment
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
                                        : annotationsPackages[indexAnnotations]?.annotationComment
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

export default AnnotationInformation
