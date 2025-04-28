// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { Component, ListFieldMerge, Attachment } from "@/object-types"
import { useTranslations } from "next-intl"
import { ReactNode, SetStateAction, Dispatch, useEffect, useState } from "react"
import styles from '../merge.module.css'
import { FaLongArrowAltLeft } from "react-icons/fa"
import { TiTick } from "react-icons/ti"
import { FaUndo } from "react-icons/fa"
import GeneralSection from "./GeneralSection"
import RolesSection from "./RolesSection"

interface AdditionalRolesMergeLists { 
    [k: string]: ListFieldMerge[]
}

export default function MergeComponent(
    {
        targetComponent, sourceComponent, finalComponentPayload, setFinalComponentPayload
    }: {
        targetComponent: Component | null, sourceComponent: Component | null,
        finalComponentPayload: Component | null, setFinalComponentPayload: Dispatch<SetStateAction<null | Component>>
    }): ReactNode {

    const t = useTranslations('default')
    const [externalIdsMergeList, setExternalIdsMergeList] = useState<ListFieldMerge[]>([])
    const [additionalDataMergeList, setAdditionalDataMergeList] = useState<ListFieldMerge[]>([])
    const [additionalRolesMergeLists, setAdditionalRolesMergeLists] = useState<AdditionalRolesMergeLists>({})
    const [attachmentsMergeList, setAttachmentsMergeList] = useState<ListFieldMerge[]>([])

    useEffect(() => {
        setFinalComponentPayload({ 
            ...targetComponent, 
            createdBy: targetComponent?._embedded?.createdBy?.email ?? '',
            attachments: targetComponent?._embedded?.['sw360:attachments'] ?? [] as Attachment[]
        } as Component)

        setExternalIdsMergeList([
            ...Object.keys(targetComponent?.externalIds ?? {})
                .filter(targetElem => Object.keys(sourceComponent?.externalIds ?? {}).filter(sourceElem => sourceElem === targetElem).length !== 0)
                .map(c => ({ value: c, presentInSource: true, presentInTarget: true, overWritten: false })),

            ...Object.keys(targetComponent?.externalIds ?? {})
                .filter(targetElem => Object.keys(sourceComponent?.externalIds ?? {}).filter(sourceElem => sourceElem === targetElem).length === 0)
                .map(c => ({ value: c, presentInSource: false, presentInTarget: true, overWritten: false })),

                ...Object.keys(sourceComponent?.externalIds ?? {})
                .filter(sourceElem => Object.keys(targetComponent?.externalIds ?? {}).filter(targetElem => sourceElem === targetElem).length === 0)
                .map(c => ({ value: c, presentInSource: true, presentInTarget: false, overWritten: false })),
        ])

        setAdditionalDataMergeList([
            ...Object.keys(targetComponent?.additionalData ?? {})
                .filter(targetElem => Object.keys(sourceComponent?.additionalData ?? {}).filter(sourceElem => sourceElem === targetElem).length !== 0)
                .map(c => ({ value: c, presentInSource: true, presentInTarget: true, overWritten: false })),

            ...Object.keys(targetComponent?.additionalData ?? {})
                .filter(targetElem => Object.keys(sourceComponent?.additionalData ?? {}).filter(sourceElem => sourceElem === targetElem).length === 0)
                .map(c => ({ value: c, presentInSource: false, presentInTarget: true, overWritten: false })),

                ...Object.keys(sourceComponent?.additionalData ?? {})
                .filter(sourceElem => Object.keys(targetComponent?.additionalData ?? {}).filter(targetElem => sourceElem === targetElem).length === 0)
                .map(c => ({ value: c, presentInSource: true, presentInTarget: false, overWritten: false })),
        ])

        setAttachmentsMergeList([
            ...(targetComponent?._embedded?.["sw360:attachments"] ?? [])
                .map(c => ({ value: c.attachmentContentId ?? '', presentInSource: false, presentInTarget: true, overWritten: false })),

            ...(sourceComponent?._embedded?.["sw360:attachments"] ?? [])
                .map(c => ({ value: c.attachmentContentId ?? '', presentInSource: true, presentInTarget: false, overWritten: false })),
        ])

        const mergeLists: AdditionalRolesMergeLists = {}
        if(targetComponent?.roles) {
            for(const role in targetComponent.roles) {
                mergeLists[role] = targetComponent.roles[role].map(targetElem => 
                    (sourceComponent?.roles?.[role] ?? []).filter(sourceElem => sourceElem === targetElem).length === 0
                    ? { value: targetElem, presentInSource: false, presentInTarget: true, overWritten: false }
                    : { value: targetElem, presentInSource: true, presentInTarget: true, overWritten: false }
                )
            }
        }

        if(sourceComponent?.roles) {
            for(const role in sourceComponent.roles) {
                if(!(role in mergeLists)) {
                    mergeLists[role] = []
                }
                mergeLists[role] = [
                    ...mergeLists[role],
                    ...sourceComponent.roles[role]
                        .filter(sourceElem => (targetComponent?.roles?.[role] ?? []).filter(targetElem => sourceElem === targetElem).length === 0)
                        .map(elem => ({ value: elem, presentInSource: true, presentInTarget: false, overWritten: false }))
                ]
            }
        }

        setAdditionalRolesMergeLists(mergeLists)
    }, [targetComponent, sourceComponent])

    return (
        <>
            {
                (targetComponent && sourceComponent && finalComponentPayload) &&
                <>
                    <GeneralSection 
                        targetComponent={targetComponent} sourceComponent={sourceComponent} 
                        finalComponentPayload={finalComponentPayload} setFinalComponentPayload={setFinalComponentPayload}
                    />
                    <div className='mb-3'>
                        <h6 className={`border-bottom fw-bold text-uppercase ${styles['text-blue']} ${styles['border-blue']} mb-2`}>
                            {t('External Ids')}
                        </h6>
                        {
                            externalIdsMergeList.map((id, i) =>
                                <div className={`border ${styles['border-blue']} p-2 ${i !== 0 ? 'border-top-0': ''}`} key={id.value}>
                                    <div className={`fw-bold ${styles['text-blue']}`}>{id.value}</div>
                                        {
                                            (id.presentInSource && id.presentInTarget) &&
                                            <div className="d-flex row">
                                                <div className="mt-2 col text-end">{targetComponent.externalIds?.[id.value]}</div>
                                                <div className="col-12 col-md-2 mx-5 text-center">
                                                    <TiTick size={40} className={styles['green']} />
                                                </div>
                                                <div className="mt-2 col text-start">{sourceComponent.externalIds?.[id.value]}</div>
                                            </div>
                                        }
                                        {
                                            (!id.presentInSource && id.presentInTarget) &&
                                            <div className="d-flex row">
                                                <div className="mt-2 col text-end">{finalComponentPayload.externalIds?.[id.value]}</div>
                                                <div className="col-12 col-md-2 mx-5 text-center">
                                                    {
                                                        finalComponentPayload.externalIds?.[id.value] === targetComponent.externalIds?.[id.value]
                                                        ? <button className="btn btn-secondary px-2"
                                                            onClick={() => {
                                                                const externalIds = { ...(finalComponentPayload.externalIds ?? {}) }
                                                                delete externalIds[id.value]
                                                                setFinalComponentPayload({ ...finalComponentPayload, externalIds })
                                                            }}
                                                        >
                                                            <FaLongArrowAltLeft />
                                                        </button> 
                                                        : <button className="btn btn-secondary px-2"
                                                            onClick={() => {
                                                                const externalIds = { 
                                                                    ...(finalComponentPayload.externalIds ?? {}), 
                                                                    [id.value]: targetComponent.externalIds?.[id.value] ?? ''
                                                                }
                                                                setFinalComponentPayload({ ...finalComponentPayload, externalIds })
                                                            }}
                                                        >
                                                            <FaUndo />
                                                        </button> 
                                                    }
                                                </div>
                                                <div className="mt-2 col text-start"></div>
                                            </div>
                                        }
                                        {
                                            (id.presentInSource && !id.presentInTarget) &&
                                            <div className="d-flex row">
                                                <div className="mt-2 col text-end">{finalComponentPayload.externalIds?.[id.value]}</div>
                                                <div className="col-12 col-md-2 mx-5 text-center">
                                                    {
                                                        finalComponentPayload.externalIds?.[id.value] !== sourceComponent.externalIds?.[id.value]
                                                        ? <button className="btn btn-secondary px-2"
                                                            onClick={() => {
                                                                const externalIds = { 
                                                                    ...(finalComponentPayload.externalIds ?? {}), 
                                                                    [id.value]: sourceComponent.externalIds?.[id.value] ?? ''
                                                                }
                                                                setFinalComponentPayload({ ...finalComponentPayload, externalIds })
                                                            }}
                                                        >
                                                            <FaLongArrowAltLeft />
                                                        </button> 
                                                        : <button className="btn btn-secondary px-2"
                                                            onClick={() => {
                                                                const externalIds = { ...(finalComponentPayload.externalIds ?? {}) }
                                                                delete externalIds[id.value]
                                                                setFinalComponentPayload({ ...finalComponentPayload, externalIds })
                                                            }}
                                                        >
                                                            <FaUndo />
                                                        </button> 
                                                    }
                                                </div>
                                                <div className="mt-2 col text-start">{sourceComponent.externalIds?.[id.value]}</div>
                                            </div>
                                        }
                                </div>
                            )
                        }
                    </div>
                    <div className='mb-3'>
                        <h6 className={`border-bottom fw-bold text-uppercase ${styles['text-blue']} ${styles['border-blue']} mb-2`}>
                            {t('Additional Data')}
                        </h6>
                        {
                            additionalDataMergeList.map((id, i) =>
                                <div className={`border ${styles['border-blue']} p-2 ${i !== 0 ? 'border-top-0': ''}`} key={id.value}>
                                    <div className={`fw-bold ${styles['text-blue']}`}>{id.value}</div>
                                        {
                                            (id.presentInSource && id.presentInTarget) &&
                                            <div className="d-flex row">
                                                <div className="mt-2 col text-end">{targetComponent.additionalData?.[id.value]}</div>
                                                <div className="col-12 col-md-2 mx-5 text-center">
                                                    <TiTick size={40} className={styles['green']} />
                                                </div>
                                                <div className="mt-2 col text-start">{sourceComponent.additionalData?.[id.value]}</div>
                                            </div>
                                        }
                                        {
                                            (!id.presentInSource && id.presentInTarget) &&
                                            <div className="d-flex row">
                                                <div className="mt-2 col text-end">{finalComponentPayload.additionalData?.[id.value]}</div>
                                                <div className="col-12 col-md-2 mx-5 text-center">
                                                    {
                                                        finalComponentPayload.additionalData?.[id.value] === targetComponent.additionalData?.[id.value]
                                                        ? <button className="btn btn-secondary px-2"
                                                            onClick={() => {
                                                                const additionalData = { ...(finalComponentPayload.additionalData ?? {}) }
                                                                delete additionalData[id.value]
                                                                setFinalComponentPayload({ ...finalComponentPayload, additionalData })
                                                            }}
                                                        >
                                                            <FaLongArrowAltLeft />
                                                        </button> 
                                                        : <button className="btn btn-secondary px-2"
                                                            onClick={() => {
                                                                const additionalData = { 
                                                                    ...(finalComponentPayload.additionalData ?? {}), 
                                                                    [id.value]: targetComponent.additionalData?.[id.value] ?? ''
                                                                }
                                                                setFinalComponentPayload({ ...finalComponentPayload, additionalData })
                                                            }}
                                                        >
                                                            <FaUndo />
                                                        </button> 
                                                    }
                                                </div>
                                                <div className="mt-2 col text-start"></div>
                                            </div>
                                        }
                                        {
                                            (id.presentInSource && !id.presentInTarget) &&
                                            <div className="d-flex row">
                                                <div className="mt-2 col text-end">{finalComponentPayload.additionalData?.[id.value]}</div>
                                                <div className="col-12 col-md-2 mx-5 text-center">
                                                    {
                                                        finalComponentPayload.additionalData?.[id.value] !== sourceComponent.additionalData?.[id.value]
                                                        ? <button className="btn btn-secondary px-2"
                                                            onClick={() => {
                                                                const additionalData = { 
                                                                    ...(finalComponentPayload.additionalData ?? {}), 
                                                                    [id.value]: sourceComponent.additionalData?.[id.value] ?? ''
                                                                }
                                                                setFinalComponentPayload({ ...finalComponentPayload, additionalData })
                                                            }}
                                                        >
                                                            <FaLongArrowAltLeft />
                                                        </button> 
                                                        : <button className="btn btn-secondary px-2"
                                                            onClick={() => {
                                                                const additionalData = { ...(finalComponentPayload.additionalData ?? {}) }
                                                                delete additionalData[id.value]
                                                                setFinalComponentPayload({ ...finalComponentPayload, additionalData })
                                                            }}
                                                        >
                                                            <FaUndo />
                                                        </button> 
                                                    }
                                                </div>
                                                <div className="mt-2 col text-start">{sourceComponent.additionalData?.[id.value]}</div>
                                            </div>
                                        }
                                </div>
                            )
                        }
                    </div>
                    <RolesSection 
                        targetComponent={targetComponent} sourceComponent={sourceComponent} 
                        finalComponentPayload={finalComponentPayload} setFinalComponentPayload={setFinalComponentPayload}
                    />
                    <div className='mb-3'>
                        <h6 className={`border-bottom fw-bold text-uppercase ${styles['text-blue']} ${styles['border-blue']} mb-2`}>
                            {t('Additional Roles')}
                        </h6>
                        {
                            Object.entries(additionalRolesMergeLists).map(([role, assignees], i) => {
                                return (
                                    <div className={`border ${styles['border-blue']} p-2 ${i !== 0 ? 'border-top-0': ''}`} key={role}>
                                        <div className={`fw-bold ${styles['text-blue']}`}>{role}</div>
                                        {
                                            assignees.map((assignee) => {
                                                if (assignee.presentInSource && assignee.presentInTarget) {
                                                    return (
                                                        <div className="d-flex row mb-1" key={assignee.value}>
                                                            <div className="mt-2 col text-end">{assignee.value}</div>
                                                            <div className="col-12 col-md-2 mx-5 text-center">
                                                                <TiTick size={25} className={styles['green']} />
                                                            </div>
                                                            <div className="mt-2 col text-start">{assignee.value}</div>
                                                        </div>
                                                    )
                                                } else if (assignee.presentInTarget) {
                                                    return (
                                                        <div className="d-flex row mb-1" key={assignee.value}>
                                                            <div className="mt-2 col text-end">{assignee.overWritten ? '' : assignee.value}</div>
                                                            <div className="col-12 col-md-2 mx-5 text-center">
                                                                {
                                                                    !assignee.overWritten
                                                                        ? <button className="btn btn-secondary px-2"
                                                                            onClick={() => {
                                                                                const newAssignees = (finalComponentPayload.roles?.[role] ?? []).filter(a => a !== assignee.value)
                                                                                setFinalComponentPayload(
                                                                                    { 
                                                                                        ...finalComponentPayload, 
                                                                                        roles: { 
                                                                                            ...(finalComponentPayload.roles ?? {}),
                                                                                            [role]: newAssignees
                                                                                        } 
                                                                                    }
                                                                                )
                
                                                                                const updatedList = assignees.map(a => {
                                                                                    if (a.value === assignee.value) {
                                                                                        return {
                                                                                            ...a,
                                                                                            overWritten: true
                                                                                        }
                                                                                    }
                                                                                    return a
                                                                                })
                                                                                setAdditionalRolesMergeLists({ ...additionalRolesMergeLists, [role]: updatedList })
                                                                            }}
                                                                        >
                                                                            <FaLongArrowAltLeft />
                                                                        </button>
                                                                        : <button className="btn btn-secondary px-2"
                                                                            onClick={() => {
                                                                                const newAssignees = finalComponentPayload.roles?.[role] ?? []
                                                                                newAssignees.push(assignee.value)
                                                                                setFinalComponentPayload(
                                                                                    { 
                                                                                        ...finalComponentPayload, 
                                                                                        roles: { 
                                                                                            ...(finalComponentPayload.roles ?? {}),
                                                                                            [role]: newAssignees
                                                                                        } 
                                                                                    }
                                                                                )
                
                                                                                const updatedList = assignees.map(a => {
                                                                                    if (a.value === assignee.value) {
                                                                                        return {
                                                                                            ...a,
                                                                                            overWritten: false
                                                                                        }
                                                                                    }
                                                                                    return a
                                                                                })
                                                                                setAdditionalRolesMergeLists({ ...additionalRolesMergeLists, [role]: updatedList })
                                                                            }}
                                                                        >
                                                                            <FaUndo />
                                                                        </button>
                                                                }
                                                            </div>
                                                            <div className="mt-2 col text-start"></div>
                                                        </div>
                                                    )
                                                } else {
                                                    return (
                                                        <div className="d-flex row mb-1" key={assignee.value}>
                                                            <div className="mt-2 col text-end">{!assignee.overWritten ? '' : assignee.value}</div>
                                                            <div className="col-12 col-md-2 mx-5 text-center">
                                                                {
                                                                    !assignee.overWritten
                                                                        ? <button className="btn btn-secondary px-2"
                                                                            onClick={() => {
                                                                                const newAssignees = finalComponentPayload.roles?.[role] ?? []
                                                                                newAssignees.push(assignee.value)
                                                                                setFinalComponentPayload(
                                                                                    { 
                                                                                        ...finalComponentPayload, 
                                                                                        roles: { 
                                                                                            ...(finalComponentPayload.roles ?? {}),
                                                                                            [role]: newAssignees
                                                                                        } 
                                                                                    }
                                                                                )
                
                                                                                const updatedList = assignees.map(a => {
                                                                                    if (a.value === assignee.value) {
                                                                                        return {
                                                                                            ...a,
                                                                                            overWritten: true
                                                                                        }
                                                                                    }
                                                                                    return a
                                                                                })
                                                                                setAdditionalRolesMergeLists({ ...additionalRolesMergeLists, [role]: updatedList })
                                                                            }}
                                                                        >
                                                                            <FaLongArrowAltLeft />
                                                                        </button>
                                                                        : <button className="btn btn-secondary px-2"
                                                                            onClick={() => {
                                                                                const newAssignees = (finalComponentPayload.roles?.[role] ?? []).filter(a => a !== assignee.value)
                                                                                setFinalComponentPayload(
                                                                                    { 
                                                                                        ...finalComponentPayload, 
                                                                                        roles: { 
                                                                                            ...(finalComponentPayload.roles ?? {}),
                                                                                            [role]: newAssignees
                                                                                        } 
                                                                                    }
                                                                                )
                
                                                                                const updatedList = assignees.map(a => {
                                                                                    if (a.value === assignee.value) {
                                                                                        return {
                                                                                            ...a,
                                                                                            overWritten: false
                                                                                        }
                                                                                    }
                                                                                    return a
                                                                                })
                                                                                setAdditionalRolesMergeLists({ ...additionalRolesMergeLists, [role]: updatedList })
                                                                            }}
                                                                        >
                                                                            <FaUndo />
                                                                        </button>
                                                                }
                                                            </div>
                                                            <div className="mt-2 col text-start">{assignee.value}</div>
                                                        </div>
                                                    )
                                                }
                                            })
                                        }
                                    </div>
                                )
                            })
                        }
                    </div>
                    <div className='mb-3'>
                        <h6 className={`border-bottom fw-bold text-uppercase ${styles['text-blue']} ${styles['border-blue']} mb-2`}>
                            {t('Releases')}
                        </h6>
                        <div className={`border ${styles['border-blue']} p-2`}>
                            {
                                targetComponent._embedded?.["sw360:releases"]?.map((release) => 
                                    <div className="d-flex row mb-1" key={release.id ?? ''}>
                                        <div className="mt-2 col text-end">{release.name}</div>
                                        <div className="col-12 col-md-2 mx-5 text-center">
                                            <button className="btn btn-secondary px-2" disabled>
                                                <FaLongArrowAltLeft />
                                            </button> 
                                        </div>
                                        <div className="mt-2 col text-start"></div>
                                    </div>
                                )
                            }
                            <div className={`${styles['orange']}`}>
                                {
                                    sourceComponent._embedded?.["sw360:releases"]?.map((release) => 
                                        <div className={`d-flex row mb-1`} key={release.id ?? ''}>
                                            <div className="mt-2 col text-end">{release.name}</div>
                                            <div className="col-12 col-md-2 mx-5 text-center">
                                                <button className="btn btn-secondary px-2" disabled>
                                                    <FaUndo />
                                                </button> 
                                            </div>
                                            <div className="mt-2 col text-start">{release.name}</div>
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                    <div className='mb-3'>
                        <h6 className={`border-bottom fw-bold text-uppercase ${styles['text-blue']} ${styles['border-blue']} mb-2`}>
                            {t('Attachments')}
                        </h6>
                        {
                            attachmentsMergeList.map(c => {
                                if (c.presentInTarget && !c.presentInSource) {
                                    const att = targetComponent._embedded?.["sw360:attachments"]?.filter((a) => a.attachmentContentId === c.value)[0]
                                    return (
                                        <div className="d-flex row mb-1" key={c.value}>
                                            <div className="mt-2 col text-end">{c.overWritten ? '' : att?.filename}</div>
                                            <div className="col-12 col-md-2 mx-5 text-center">
                                                {
                                                    !c.overWritten
                                                        ? <button className="btn btn-secondary px-2"
                                                            onClick={() => {
                                                                const attachments = (finalComponentPayload.attachments ?? []).filter(a => a.attachmentContentId !== c.value)
                                                                setFinalComponentPayload({ ...finalComponentPayload, attachments })

                                                                const updatedAttachmentsMergeList = attachmentsMergeList.map(a => {
                                                                    if (a.value === c.value) {
                                                                        return {
                                                                            ...a,
                                                                            overWritten: true
                                                                        }
                                                                    }
                                                                    return a
                                                                })
                                                                setAttachmentsMergeList(updatedAttachmentsMergeList)
                                                            }}
                                                        >
                                                            <FaLongArrowAltLeft />
                                                        </button>
                                                        : <button className="btn btn-secondary px-2"
                                                            onClick={() => {
                                                                const attachments = finalComponentPayload.attachments ?? []
                                                                if(att !== undefined) {
                                                                    attachments.push(att)
                                                                }
                                                                setFinalComponentPayload({ ...finalComponentPayload, attachments })

                                                                const updatedAttachmentsMergeList = attachmentsMergeList.map(a => {
                                                                    if (a.value === c.value) {
                                                                        return {
                                                                            ...a,
                                                                            overWritten: false
                                                                        }
                                                                    }
                                                                    return a
                                                                })
                                                                setAttachmentsMergeList(updatedAttachmentsMergeList)
                                                            }}
                                                        >
                                                            <FaUndo />
                                                        </button>
                                                }
                                            </div>
                                            <div className="mt-2 col text-start"></div>
                                        </div>
                                    )
                                } else {
                                    const att = sourceComponent._embedded?.["sw360:attachments"]?.filter((a) => a.attachmentContentId === c.value)[0]
                                    return (
                                        <div className="d-flex row mb-1" key={c.value}>
                                            <div className="mt-2 col text-end">{!c.overWritten ? '' : att?.filename}</div>
                                            <div className="col-12 col-md-2 mx-5 text-center">
                                                {
                                                    !c.overWritten
                                                        ? <button className="btn btn-secondary px-2"
                                                            onClick={() => {
                                                                const attachments = finalComponentPayload.attachments ?? []
                                                                if(att !== undefined) {
                                                                    attachments.push(att)
                                                                }
                                                                setFinalComponentPayload({ ...finalComponentPayload, attachments })

                                                                const updatedAttachmentsMergeList = attachmentsMergeList.map(a => {
                                                                    if (a.value === c.value) {
                                                                        return {
                                                                            ...a,
                                                                            overWritten: true
                                                                        }
                                                                    }
                                                                    return a
                                                                })
                                                                setAttachmentsMergeList(updatedAttachmentsMergeList)
                                                            }}
                                                        >
                                                            <FaLongArrowAltLeft />
                                                        </button>
                                                        : <button className="btn btn-secondary px-2"
                                                            onClick={() => {
                                                                const attachments = (finalComponentPayload.attachments ?? []).filter(a => a.attachmentContentId !== c.value)
                                                                setFinalComponentPayload({ ...finalComponentPayload, attachments })

                                                                const updatedAttachmentsMergeList = attachmentsMergeList.map(a => {
                                                                    if (a.value === c.value) {
                                                                        return {
                                                                            ...a,
                                                                            overWritten: false
                                                                        }
                                                                    }
                                                                    return a
                                                                })
                                                                setAttachmentsMergeList(updatedAttachmentsMergeList)
                                                            }}
                                                        >
                                                            <FaUndo />
                                                        </button>
                                                }
                                            </div>
                                            <div className="mt-2 col text-start">{att?.filename}</div>
                                        </div>
                                    )
                                }
                            })
                        }
                    </div>
                </>
            }
        </>
    )
}