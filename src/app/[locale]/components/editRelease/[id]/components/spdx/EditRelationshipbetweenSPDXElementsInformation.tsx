// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import { ReactNode, useState } from 'react'
import { FaTrashAlt } from 'react-icons/fa'

import { PackageInformation, RelationshipsBetweenSPDXElements, SPDX, SPDXDocument } from '@/object-types'
import CommonUtils from '@/utils/common.utils'

interface Props {
    indexRelation: number
    setIndexRelation: React.Dispatch<React.SetStateAction<number>>
    relationshipsBetweenSPDXElementSPDXs: RelationshipsBetweenSPDXElements[]
    setRelationshipsBetweenSPDXElementSPDXs: React.Dispatch<React.SetStateAction<RelationshipsBetweenSPDXElements[]>>
    relationshipsBetweenSPDXElementPackages: RelationshipsBetweenSPDXElements[]
    setRelationshipsBetweenSPDXElementPackages: React.Dispatch<React.SetStateAction<RelationshipsBetweenSPDXElements[]>>
    SPDXPayload: SPDX
    setSPDXPayload: React.Dispatch<React.SetStateAction<SPDX>>
}

const EditRelationshipbetweenSPDXElementsInformation = ({
    indexRelation,
    setIndexRelation,
    relationshipsBetweenSPDXElementSPDXs,
    setRelationshipsBetweenSPDXElementSPDXs,
    relationshipsBetweenSPDXElementPackages,
    setRelationshipsBetweenSPDXElementPackages,
    SPDXPayload,
    setSPDXPayload,
}: Props): ReactNode => {
    const [toggle, setToggle] = useState(false)
    const [changeSource, setChangeSource] = useState(false)
    const [isSourceSPDXDocument, setIsSourceSPDXDocument] = useState<boolean>(true)

    const relationTypes: Array<string> = [
        'DESCRIBES',
        'DESCRIBED_BY',
        'CONTAINS',
        'CONTAINED_BY',
        'DEPENDS_ON',
        'DEPENDENCY_OF',
        'DEPENDENCY_MANIFEST_OF',
        'BUILD_DEPENDENCY_OF',
        'DEV_DEPENDENCY_OF',
        'OPTIONAL_DEPENDENCY_OF',
        'PROVIDED_DEPENDENCY_OF',
        'TEST_DEPENDENCY_OF',
        'RUNTIME_DEPENDENCY_OF',
        'EXAMPLE_OF',
        'GENERATES',
        'GENERATED_FROM',
        'ANCESTOR_OF',
        'DESCENDANT_OF',
        'VARIANT_OF',
        'DISTRIBUTION_ARTIFACT',
        'PATCH_FOR',
        'PATCH_APPLIED',
        'COPY_OF',
        'FILE_ADDED',
        'FILE_DELETED',
        'FILE_MODIFIED',
        'EXPANDED_FROM_ARCHIVE',
        'DYNAMIC_LINK',
        'STATIC_LINK',
        'DATA_FILE_OF',
        'TEST_CASE_OF',
        'BUILD_TOOL_OF',
        'DEV_TOOL_OF',
        'TEST_OF',
        'TEST_TOOL_OF',
        'DOCUMENTATION_OF',
        'OPTIONAL_COMPONENT_OF',
        'METAFILE_OF',
        'PACKAGE_OF',
        'AMENDS',
        'PREREQUISITE_FOR',
        'HAS_PREREQUISITE',
        'REQUIREMENT_DESCRIPTION_FOR',
        'SPECIFICATION_FOR',
        'OTHER',
    ]

    const changeRelationshipSource = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setChangeSource(!changeSource)
        setIndexRelation(0)
        const relationshipType: string = e.target.value
        if (relationshipType === 'spdxDoucument') {
            setIsSourceSPDXDocument(true)
            if (!CommonUtils.isNullEmptyOrUndefinedArray(relationshipsBetweenSPDXElementSPDXs)) {
                setRelationshipsBetweenSPDXElementSPDXs(relationshipsBetweenSPDXElementSPDXs)
                setSPDXPayload({
                    ...SPDXPayload,
                    spdxDocument: {
                        ...SPDXPayload.spdxDocument,
                        relationships: relationshipsBetweenSPDXElementSPDXs,
                    } as SPDXDocument,
                })
            } else {
                setRelationshipsBetweenSPDXElementSPDXs([])
                setSPDXPayload({
                    ...SPDXPayload,
                    spdxDocument: {
                        ...SPDXPayload.spdxDocument,
                        relationships: [],
                    } as SPDXDocument,
                })
            }
        } else if (relationshipType === 'package') {
            setIsSourceSPDXDocument(false)
            if (!CommonUtils.isNullEmptyOrUndefinedArray(relationshipsBetweenSPDXElementPackages)) {
                setRelationshipsBetweenSPDXElementPackages(relationshipsBetweenSPDXElementPackages)
                setSPDXPayload({
                    ...SPDXPayload,
                    packageInformation: {
                        ...SPDXPayload.packageInformation,
                        relationships: relationshipsBetweenSPDXElementPackages,
                    } as PackageInformation,
                })
            } else {
                setRelationshipsBetweenSPDXElementPackages([])
                setSPDXPayload({
                    ...SPDXPayload,
                    packageInformation: {
                        ...SPDXPayload.packageInformation,
                        relationships: [],
                    } as PackageInformation,
                })
            }
        }
    }
    const [increIndex, setIncreIndex] = useState(0)
    const [isAdd, setIsAdd] = useState(false)

    const displayIndex = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setChangeSource(false)
        const index: string = e.target.value
        if (isSourceSPDXDocument) {
            setIndexRelation(parseInt(index))
            setNumberIndexSPDX(parseInt(index))
            if (parseInt(index) === increIndex) {
                setIsAdd(true)
            } else {
                setIncreIndex(parseInt(index))
            }
        } else {
            if (parseInt(index) === increIndex) {
                setIsAdd(true)
            } else {
                setIncreIndex(parseInt(index))
            }
            setIndexRelation(parseInt(index))
            setNumberIndexPackage(parseInt(index))
        }
    }

    const addRelationshipsBetweenSPDXElementsSPDX = () => {
        setChangeSource(false)
        const arrayExternals: RelationshipsBetweenSPDXElements[] = [...relationshipsBetweenSPDXElementSPDXs]
        if (CommonUtils.isNullEmptyOrUndefinedArray(relationshipsBetweenSPDXElementSPDXs)) {
            setIndexRelation(0)
        }
        setIncreIndex(relationshipsBetweenSPDXElementSPDXs.length)
        setNumberIndexSPDX(relationshipsBetweenSPDXElementSPDXs.length)
        setIsAdd(true)
        const relationshipsBetweenSPDXElements: RelationshipsBetweenSPDXElements = {
            spdxElementId: '', // 11.1
            relationshipType: '', // 11.1
            relatedSpdxElement: '', // 11.1
            relationshipComment: '', // 11.2
            index: relationshipsBetweenSPDXElementSPDXs.length,
        }
        setIndexRelation(relationshipsBetweenSPDXElementSPDXs.length)
        arrayExternals.push(relationshipsBetweenSPDXElements)
        setRelationshipsBetweenSPDXElementSPDXs(arrayExternals)
        setSPDXPayload({
            ...SPDXPayload,
            spdxDocument: {
                ...SPDXPayload.spdxDocument,
                relationships: arrayExternals,
            } as SPDXDocument,
        })
    }

    const addRelationshipsBetweenSPDXElementsPackage = () => {
        setChangeSource(false)
        const arrayExternals: RelationshipsBetweenSPDXElements[] = [...relationshipsBetweenSPDXElementPackages]
        if (CommonUtils.isNullEmptyOrUndefinedArray(relationshipsBetweenSPDXElementPackages)) {
            setIndexRelation(0)
        }
        setIncreIndex(relationshipsBetweenSPDXElementPackages.length)
        setNumberIndexSPDX(relationshipsBetweenSPDXElementPackages.length)
        setIsAdd(true)
        const relationshipsBetweenSPDXElements: RelationshipsBetweenSPDXElements = {
            spdxElementId: '', // 11.1
            relationshipType: '', // 11.1
            relatedSpdxElement: '', // 11.1
            relationshipComment: '', // 11.2
            index: relationshipsBetweenSPDXElementPackages.length,
        }
        setIndexRelation(relationshipsBetweenSPDXElementPackages.length)
        arrayExternals.push(relationshipsBetweenSPDXElements)
        setRelationshipsBetweenSPDXElementPackages(arrayExternals)
        setSPDXPayload({
            ...SPDXPayload,
            packageInformation: {
                ...SPDXPayload.packageInformation,
                relationships: arrayExternals,
            } as PackageInformation,
        })
    }

    const addRelations = () => {
        if (isSourceSPDXDocument) {
            addRelationshipsBetweenSPDXElementsSPDX()
        } else {
            addRelationshipsBetweenSPDXElementsPackage()
        }
    }

    const updateField = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
        if (isSourceSPDXDocument) {
            const relationsUpdate: RelationshipsBetweenSPDXElements[] = relationshipsBetweenSPDXElementSPDXs.map(
                (relation, index) => {
                    if (index === indexRelation) {
                        return {
                            ...relation,
                            [e.target.name]: e.target.value,
                        }
                    }
                    return relation
                },
            )
            setRelationshipsBetweenSPDXElementSPDXs(relationsUpdate)
            setSPDXPayload({
                ...SPDXPayload,
                spdxDocument: {
                    ...SPDXPayload.spdxDocument,
                    relationships: relationsUpdate,
                } as SPDXDocument,
            })
        } else {
            const relationsUpdate: RelationshipsBetweenSPDXElements[] = relationshipsBetweenSPDXElementPackages.map(
                (relation, index) => {
                    if (index === indexRelation) {
                        return {
                            ...relation,
                            [e.target.name]: e.target.value,
                        }
                    }
                    return relation
                },
            )
            setRelationshipsBetweenSPDXElementPackages(relationsUpdate)
            setSPDXPayload({
                ...SPDXPayload,
                packageInformation: {
                    ...SPDXPayload.packageInformation,
                    relationships: relationsUpdate,
                } as PackageInformation,
            })
        }
    }

    const [numberIndexSPDX, setNumberIndexSPDX] = useState<number>(0)
    const [numberIndexPackage, setNumberIndexPackage] = useState<number>(0)
    const [isDeleteSucces, setIsDeleteSucces] = useState(false)

    const deleteRelation = () => {
        if (isSourceSPDXDocument) {
            if (relationshipsBetweenSPDXElementSPDXs.length == 1) {
                setRelationshipsBetweenSPDXElementSPDXs([])
                setIndexRelation(0)
                setSPDXPayload({
                    ...SPDXPayload,
                    spdxDocument: {
                        ...SPDXPayload.spdxDocument,
                        relationships: [],
                    } as SPDXDocument,
                })
            } else {
                let relationships: RelationshipsBetweenSPDXElements[] = []
                relationships = relationshipsBetweenSPDXElementSPDXs.filter(
                    (relatedSPDXElement) => numberIndexSPDX != relatedSPDXElement.index,
                )
                for (let index = 0; index < relationships.length; index++) {
                    relationships[index].index = index
                }
                setRelationshipsBetweenSPDXElementSPDXs(relationships)
                setIndexRelation(0)
                setNumberIndexSPDX(indexRelation)
                setIsDeleteSucces(true)
                setSPDXPayload({
                    ...SPDXPayload,
                    spdxDocument: {
                        ...SPDXPayload.spdxDocument,
                        relationships: relationships,
                    } as SPDXDocument,
                })
                if (!CommonUtils.isNullEmptyOrUndefinedArray(relationships)) {
                    setNumberIndexSPDX(relationships[0].index)
                }
            }
        } else {
            if (relationshipsBetweenSPDXElementPackages.length == 1) {
                setRelationshipsBetweenSPDXElementPackages([])
                setSPDXPayload({
                    ...SPDXPayload,
                    packageInformation: {
                        ...SPDXPayload.packageInformation,
                        relationships: [],
                    } as PackageInformation,
                })
            } else {
                let relationships: RelationshipsBetweenSPDXElements[] = []
                relationships = relationshipsBetweenSPDXElementPackages.filter(
                    (relatedSPDXElement) => numberIndexPackage != relatedSPDXElement.index,
                )
                for (let index = 0; index < relationships.length; index++) {
                    relationships[index].index = index
                }
                setRelationshipsBetweenSPDXElementPackages(relationships)
                setIndexRelation(0)
                setNumberIndexPackage(indexRelation)
                setIsDeleteSucces(true)
                setSPDXPayload({
                    ...SPDXPayload,
                    packageInformation: {
                        ...SPDXPayload.packageInformation,
                        relationships: relationships,
                    } as PackageInformation,
                })
                if (!CommonUtils.isNullEmptyOrUndefinedArray(relationships)) {
                    setNumberIndexPackage(relationships[0].index)
                }
            }
        }
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
                    <th colSpan={2}>11. Relationship between SPDX Elements Information</th>
                </tr>
            </thead>
            <tbody hidden={toggle}>
                <tr>
                    <td>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                marginBottom: '0.75rem',
                                paddingLeft: '1rem',
                            }}
                        >
                            <label
                                htmlFor='selectRelationshipSource'
                                style={{ textDecoration: 'underline' }}
                                className='sub-title lableSPDX'
                            >
                                Select Source
                            </label>
                            <select
                                id='selectRelationshipSource'
                                className='form-control spdx-select always-enable form-select'
                                style={{ marginRight: '4rem' }}
                                onChange={changeRelationshipSource}
                            >
                                <option value='spdxDoucument'>SPDX Document</option>
                                <option value='package'>Package</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: '0.75rem' }}>
                                <label
                                    htmlFor='selectRelationship'
                                    style={{ textDecoration: 'underline' }}
                                    className='sub-title lableSPDX'
                                >
                                    Select Relationship
                                </label>
                                <select
                                    id='selectRelationship'
                                    className='form-control spdx-select form-select'
                                    onChange={displayIndex}
                                    disabled={
                                        isSourceSPDXDocument
                                            ? CommonUtils.isNullEmptyOrUndefinedArray(
                                                  relationshipsBetweenSPDXElementSPDXs,
                                              )
                                            : CommonUtils.isNullEmptyOrUndefinedArray(
                                                  relationshipsBetweenSPDXElementPackages,
                                              )
                                    }
                                    value={
                                        changeSource
                                            ? 0
                                            : isAdd
                                              ? isDeleteSucces
                                                  ? indexRelation
                                                  : increIndex
                                              : isSourceSPDXDocument
                                                ? numberIndexSPDX
                                                : numberIndexPackage
                                    }
                                >
                                    {isSourceSPDXDocument
                                        ? relationshipsBetweenSPDXElementSPDXs.map((item) => (
                                              <option
                                                  key={item.index}
                                                  value={item.index}
                                              >
                                                  {item.index + 1}
                                              </option>
                                          ))
                                        : relationshipsBetweenSPDXElementPackages.map((item) => (
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
                                    onClick={deleteRelation}
                                />
                            </div>
                            <button
                                className='spdx-add-button-main'
                                name='add-relationship'
                                onClick={addRelations}
                            >
                                Add new Relationship
                            </button>
                        </div>
                    </td>
                </tr>
                <>
                    <tr>
                        <td>
                            <div className='form-group'>
                                <label
                                    htmlFor='spdxElement'
                                    className='lableSPDX'
                                >
                                    11.1 Relationship
                                </label>
                                <div style={{ display: 'flex' }}>
                                    <input
                                        style={{ marginRight: '1rem' }}
                                        id='spdxElement'
                                        className='form-control'
                                        name='spdxElementId'
                                        type='text'
                                        placeholder='Enter SPDX element'
                                        onChange={updateField}
                                        value={
                                            isSourceSPDXDocument
                                                ? (relationshipsBetweenSPDXElementSPDXs[indexRelation]?.spdxElementId ??
                                                  '')
                                                : (relationshipsBetweenSPDXElementPackages[indexRelation]
                                                      ?.spdxElementId ?? '')
                                        }
                                    />
                                    <select
                                        className='form-control form-select'
                                        id='relationshipType'
                                        name='relationshipType'
                                        style={{ marginRight: '1rem' }}
                                        onChange={updateField}
                                        value={
                                            isSourceSPDXDocument
                                                ? (relationshipsBetweenSPDXElementSPDXs[indexRelation]
                                                      ?.relationshipType ?? '')
                                                : (relationshipsBetweenSPDXElementPackages[indexRelation]
                                                      ?.relationshipType ?? '')
                                        }
                                    >
                                        <option value=''></option>
                                        {relationTypes.map((type) => (
                                            <option
                                                key={type}
                                                value={type}
                                            >
                                                {type}
                                            </option>
                                        ))}
                                    </select>
                                    <input
                                        id='relatedSPDXElement'
                                        className='form-control'
                                        name='relatedSpdxElement'
                                        onChange={updateField}
                                        type='text'
                                        placeholder='Enter related SPDX element'
                                        value={
                                            isSourceSPDXDocument
                                                ? (relationshipsBetweenSPDXElementSPDXs[indexRelation]
                                                      ?.relatedSpdxElement ?? '')
                                                : (relationshipsBetweenSPDXElementPackages[indexRelation]
                                                      ?.relatedSpdxElement ?? '')
                                        }
                                    />
                                </div>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <div className='form-group'>
                                <label
                                    htmlFor='relationshipComment'
                                    className='lableSPDX'
                                >
                                    11.2 Relationship comment
                                </label>
                                <textarea
                                    className='form-control'
                                    id='relationshipComment'
                                    onChange={updateField}
                                    rows={5}
                                    name='relationshipComment'
                                    placeholder='Enter relationship comment'
                                    value={
                                        isSourceSPDXDocument
                                            ? (relationshipsBetweenSPDXElementSPDXs[indexRelation]
                                                  ?.relationshipComment ?? '')
                                            : (relationshipsBetweenSPDXElementPackages[indexRelation]
                                                  ?.relationshipComment ?? '')
                                    }
                                ></textarea>
                            </div>
                        </td>
                    </tr>
                </>
            </tbody>
        </table>
    )
}

export default EditRelationshipbetweenSPDXElementsInformation
