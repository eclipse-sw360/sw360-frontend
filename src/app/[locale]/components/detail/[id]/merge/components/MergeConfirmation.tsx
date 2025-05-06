// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { Component, Attachment } from "@/object-types"
import { useTranslations } from "next-intl"
import { ReactNode } from "react"

export default function MergeComponentConfirmation(
    {
        finalComponentPayload, targetComponent, sourceComponent
    }: {
        finalComponentPayload: Component | null, targetComponent: Component | null, sourceComponent: Component | null
    }): ReactNode {

    const t = useTranslations('default')
    return (
        <>
            {
                finalComponentPayload && targetComponent && sourceComponent &&
                <>
                    <div className='mb-3'>
                        <h6 className="border-bottom fw-bold text-uppercase text-blue border-blue mb-2">
                            {t('General')}
                        </h6>
                        <div className="border border-blue p-2">
                            <div className="fw-bold text-blue">{t('Name')}</div>
                            <div className="mt-2">{finalComponentPayload.name}</div>
                        </div>
                        <div className="border border-top-0 border-blue p-2">
                            <div className="fw-bold text-blue">{t('Created on')}</div>
                            <div className="mt-2 col">{finalComponentPayload.createdOn}</div>
                        </div>
                        <div className="border border-top-0 border-blue p-2">
                            <div className="fw-bold text-blue">{t('Created by')}</div>
                            <div className="mt-2 col">{finalComponentPayload.createdBy}</div>
                        </div>
                        <div className="border border-top-0 border-blue p-2">
                            <div className="fw-bold text-blue">{t('Categories')}</div>
                            {
                                (finalComponentPayload.categories ?? []).join(', ')
                            }
                        </div>
                        <div className="border border-top-0 border-blue p-2">
                            <div className="fw-bold text-blue">{t('Component Type')}</div>
                            <div className="mt-2 col">{finalComponentPayload.componentType}</div>
                        </div>
                        <div className="border border-top-0 border-blue p-2">
                            <div className="fw-bold text-blue">{t('Default vendor')}</div>
                            <div className="d-flex row">
                                <div className="mt-2 col">{finalComponentPayload.defaultVendor?.fullName}</div>
                            </div>
                        </div>
                        <div className="border border-top-0 border-blue p-2">
                            <div className="fw-bold text-blue">{t('Homepage')}</div>
                            <div className="mt-2 col">{finalComponentPayload.homepage}</div>
                        </div>
                        <div className="border border-top-0 border-blue p-2">
                            <div className="fw-bold text-blue">{t('Blog')}</div>
                            <div className="mt-2 col">{finalComponentPayload.blog}</div>
                        </div>
                        <div className="border border-top-0 border-blue p-2">
                            <div className="fw-bold text-blue">{t('Wiki')}</div>
                            <div className="mt-2 col">{finalComponentPayload.wiki}</div>
                        </div>
                        <div className="border border-top-0 border-blue p-2">
                            <div className="fw-bold text-blue">{t('Mailing list')}</div>
                            <div className="mt-2 col">{finalComponentPayload.mailinglist}</div>
                        </div>
                        <div className="border border-top-0 border-blue p-2">
                            <div className="fw-bold text-blue">{t('Description')}</div>
                            <div className="mt-2 col">{finalComponentPayload.description}</div>
                        </div>
                    </div>
                    <div className='mb-3'>
                        <h6 className="border-bottom fw-bold text-uppercase text-blue border-blue mb-2">
                            {t('External Ids')}
                        </h6>
                        {
                            Object.entries(finalComponentPayload.externalIds ?? {}).map((elem: string[], i) =>
                                <div className={`border border-blue p-2 ${i !== 0 ? 'border-top-0': ''}`} key={elem[0]}>
                                    <div className="fw-bold text-blue">{elem[0]}</div>
                                        <div className="d-flex row">
                                            <div className="mt-2 col">{elem[1]}</div>
                                        </div>
                                </div>
                            )
                        }
                    </div>
                    <div className='mb-3'>
                        <h6 className="border-bottom fw-bold text-uppercase text-blue border-blue mb-2">
                            {t('Additional Data')}
                        </h6>
                        {
                            Object.entries(finalComponentPayload.additionalData ?? {}).map((elem: string[], i) =>
                                <div className={`border border-blue p-2 ${i !== 0 ? 'border-top-0': ''}`} key={elem[0]}>
                                    <div className="fw-bold text-blue">{elem[0]}</div>
                                        <div className="d-flex row">
                                            <div className="mt-2 col">{elem[1]}</div>
                                        </div>
                                </div>
                            )
                        }
                    </div>
                    <div className='mb-3'>
                        <h6 className="border-bottom fw-bold text-uppercase text-blue border-blue mb-2">
                            {t('Roles')}
                        </h6>
                        <div className="border border-blue p-2">
                            <div className="fw-bold text-blue">{t('Component Owner')}</div>
                            <div className="mt-2 col text-end">{finalComponentPayload.componentOwner}</div>
                        </div>
                        <div className="border border-top-0 border-blue p-2">
                            <div className="fw-bold text-blue">{t('Owner Accounting Unit')}</div>
                            <div className="mt-2 col text-end">{finalComponentPayload.ownerAccountingUnit}</div>
                        </div>
                        <div className="border border-top-0 border-blue p-2">
                            <div className="fw-bold text-blue">{t('Owner Billing Group')}</div>
                            <div className="mt-2 col text-end">{finalComponentPayload.ownerGroup}</div>
                        </div>
                        <div className="border border-top-0 border-blue p-2">
                            <div className="fw-bold text-blue">{t('Owner Country')}</div>
                            <div className="mt-2 col text-end">{finalComponentPayload.ownerCountry}</div>
                        </div>
                        <div className="border border-top-0 border-blue p-2">
                            <div className="fw-bold text-blue">{t('Moderators')}</div>
                            {
                                (finalComponentPayload.moderators ?? []).map(mod => <p key={mod}>{mod}</p>)
                            }
                        </div>
                    </div>
                    <div className='mb-3'>
                        <h6 className="border-bottom fw-bold text-uppercase text-blue border-blue mb-2">
                            {t('Additional Roles')}
                        </h6>
                        {
                            Object.entries(finalComponentPayload.roles ?? {}).map(([role, assignees], i) => {
                                return (
                                    <div className={`border border-blue p-2 ${i !== 0 ? 'border-top-0': ''}`} key={role}>
                                        <div className="fw-bold text-blue">{role}</div>
                                        {
                                            assignees.map((assignee) => <p key={assignee}>{assignee}</p>)
                                        }
                                    </div>
                                )
                            })
                        }
                    </div>
                    <div className='mb-3'>
                        <h6 className="border-bottom fw-bold text-uppercase text-blue border-blue mb-2">
                            {t('Releases')}
                        </h6>
                        <div className="border border-blue p-2">
                            {
                                targetComponent._embedded?.["sw360:releases"]?.map((release) => <p key={release.id}>{release.name}</p>)
                            }
                            {
                                sourceComponent._embedded?.["sw360:releases"]?.map((release) => <p key={release.id}>{release.name}</p>)
                            }
                        </div>
                    </div>
                    <div className='mb-3'>
                        <h6 className="border-bottom fw-bold text-uppercase text-blue border-blue mb-2">
                            {t('Attachments')}
                        </h6>
                        <div className="border border-blue p-2">
                            {
                                (finalComponentPayload.attachments ?? [] as Attachment[]).map((att) => <p key={att.attachmentContentId}>{att.filename}</p>)
                            }
                        </div>
                    </div>
                </>
            }
        </>
    )   
}