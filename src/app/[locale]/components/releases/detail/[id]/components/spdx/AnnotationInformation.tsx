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
import { ReactNode, useState } from 'react'

interface Props {
    annotationsSelection: { index: number; isSPDXDocument: boolean }
    setAnnotationsSelection: React.Dispatch<React.SetStateAction<{ index: number; isSPDXDocument: boolean }>>
    annotationsSPDXs?: Annotations[]
    setAnnotationsSPDXs: React.Dispatch<React.SetStateAction<Annotations[]>>
    annotationsPackages?: Annotations[]
    setAnnotationsPackages: React.Dispatch<React.SetStateAction<Annotations[]>>
}

const AnnotationInformation = ({
    annotationsSelection,
    setAnnotationsSelection,
    annotationsSPDXs,
    setAnnotationsSPDXs,
    annotationsPackages,
    setAnnotationsPackages,
}: Props): ReactNode => {
    const [toggle, setToggle] = useState(false)
    const [changeSource, setChangeSource] = useState(false)

    const changeAnnotationSource = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setChangeSource(true)
        const relationshipType: string = e.target.value
        if (relationshipType === 'spdxDocument') {
            setAnnotationsSelection({
                index: 0,
                isSPDXDocument: true,
            })
            if (!CommonUtils.isNullEmptyOrUndefinedArray(annotationsSPDXs)) {
                setAnnotationsSPDXs(annotationsSPDXs)
            } else {
                setAnnotationsSPDXs([])
            }
        } else if (relationshipType === 'package') {
            setAnnotationsSelection({
                index: 0,
                isSPDXDocument: false,
            })
            if (!CommonUtils.isNullEmptyOrUndefinedArray(annotationsPackages)) {
                setAnnotationsPackages(annotationsPackages)
            } else {
                setAnnotationsPackages([])
            }
        }
    }

    const displayIndex = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const index: string = e.target.value
        setAnnotationsSelection({
            ...annotationsSelection,
            index: parseInt(index),
        })
        setChangeSource(false)
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
                            <option
                                value='spdxDocument'
                                selected={annotationsSelection.isSPDXDocument}
                            >
                                SPDX Document
                            </option>
                            <option
                                value='package'
                                selected={!annotationsSelection.isSPDXDocument}
                            >
                                Package
                            </option>
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
                            value={changeSource ? 0 : annotationsSelection.index}
                            disabled={
                                annotationsSelection.isSPDXDocument
                                    ? CommonUtils.isNullEmptyOrUndefinedArray(annotationsSPDXs)
                                    : CommonUtils.isNullEmptyOrUndefinedArray(annotationsPackages)
                            }
                        >
                            {annotationsSelection.isSPDXDocument
                                ? annotationsSPDXs?.map((item) => (
                                      <option
                                          key={item.index}
                                          value={item.index}
                                          selected={item.index === annotationsSelection.index}
                                      >
                                          {item.index + 1}
                                      </option>
                                  ))
                                : annotationsPackages?.map((item) => (
                                      <option
                                          key={item.index}
                                          value={item.index}
                                          selected={item.index === annotationsSelection.index}
                                      >
                                          {item.index + 1}
                                      </option>
                                  ))}
                        </select>
                    </td>
                </tr>

                {(annotationsSelection.isSPDXDocument
                    ? annotationsSPDXs && annotationsSPDXs[annotationsSelection.index]
                    : annotationsPackages && annotationsPackages[annotationsSelection.index]) && (
                    <>
                        <tr className='annotation-document'>
                            <td>12.1 Annotator</td>
                            <td>
                                <p className='spdx-col-2 '>
                                    {annotationsSelection.isSPDXDocument ? (
                                        <>
                                            {annotationsSPDXs
                                                ? annotationsSPDXs[annotationsSelection.index].annotator
                                                : ''}
                                        </>
                                    ) : (
                                        <>
                                            {annotationsPackages
                                                ? annotationsPackages[annotationsSelection.index].annotator
                                                : ''}
                                        </>
                                    )}
                                </p>
                            </td>
                        </tr>
                        <tr className='annotation-document'>
                            <td>12.2 Annotation date</td>
                            <td>
                                <p
                                    className='spdx-col-2 '
                                    id='annotation-document-date-${loop.count}'
                                >
                                    {annotationsSelection.isSPDXDocument ? (
                                        <>
                                            {annotationsSPDXs
                                                ? annotationsSPDXs[annotationsSelection.index].annotationDate
                                                : ''}
                                        </>
                                    ) : (
                                        <>
                                            {annotationsPackages
                                                ? annotationsPackages[annotationsSelection.index].annotationDate
                                                : ''}
                                        </>
                                    )}
                                </p>
                            </td>
                        </tr>
                        <tr className='annotation-document'>
                            <td>12.3 Annotation type</td>
                            <td>
                                <div className='spdx-col-2'>
                                    <div className='spdx-flex-row'>
                                        <div className='spdx-col-3'>
                                            {annotationsSelection.isSPDXDocument ? (
                                                <>
                                                    {annotationsSPDXs
                                                        ? annotationsSPDXs[annotationsSelection.index].annotationType
                                                        : ''}
                                                </>
                                            ) : (
                                                <>
                                                    {annotationsPackages
                                                        ? annotationsPackages[annotationsSelection.index].annotationType
                                                        : ''}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr className='annotation-document'>
                            <td>12.4 SPDX identifier reference</td>
                            <td>
                                {annotationsSelection.isSPDXDocument ? (
                                    <>
                                        {annotationsSPDXs ? annotationsSPDXs[annotationsSelection.index].spdxIdRef : ''}
                                    </>
                                ) : (
                                    <>
                                        {annotationsPackages
                                            ? annotationsPackages[annotationsSelection.index].spdxIdRef
                                            : ''}
                                    </>
                                )}
                            </td>
                        </tr>
                        <tr className='annotation-document'>
                            <td>12.5 Annotation comment</td>
                            <td>
                                <p
                                    className='spdx-col-2 '
                                    id='documentAnnotationComment-${annotations.index}'
                                >
                                    {annotationsSelection.isSPDXDocument ? (
                                        <>
                                            {annotationsSPDXs
                                                ? annotationsSPDXs[annotationsSelection.index].annotationComment
                                                      .trim()
                                                      .split('\n')
                                                      .map((item) => (
                                                          <>
                                                              {item}
                                                              <br />
                                                          </>
                                                      ))
                                                : ''}
                                        </>
                                    ) : (
                                        <>
                                            {annotationsPackages
                                                ? annotationsPackages[annotationsSelection.index].annotationComment
                                                      .trim()
                                                      .split('\n')
                                                      .map((item) => (
                                                          <>
                                                              {item}
                                                              <br />
                                                          </>
                                                      ))
                                                : ''}
                                        </>
                                    )}
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
