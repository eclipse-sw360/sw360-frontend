// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

"use client"

import { useTranslations } from 'next-intl'
import { COMMON_NAMESPACE } from '@/object-types/Constants'

import { AdministrationDataType } from '@/object-types/AdministrationDataType'

const Capitalize = (text: string) => text.split("_").reduce((s, c) => s + " " + (c.charAt(0) + c.substring(1).toLocaleLowerCase()), "")

export default function Administration({ data }: { data: AdministrationDataType }) {

    const t = useTranslations(COMMON_NAMESPACE)     

    return (
        <>
            <div className="ms-3 me-2">
                <div className="row mb-4">
                    <div className="row header mb-2">
                        <h6>{t("Clearing")}</h6>
                    </div>
                    <div className="row">
                        <div className="col-lg-4">{t("Project Clearing State")}:</div>
                        <div className="col">{Capitalize(data.projectClearingState)}</div>
                        <hr className="my-2" />
                    </div>
                    <div className="row">
                        <div className="col-lg-4">{t("Clearing Details")}:</div>
                        <div className="col">{data.clearingDetails}</div>
                        <hr className="my-2" />
                    </div>
                    <div className="row">
                        <div className="col-lg-4">{t("Clearing Team")}:</div>
                        <div className="col">{data.clearingTeam}</div>
                        <hr className="my-2" />
                    </div>
                    <div className="row">
                        <div className="col-lg-4">{t("Deadline for pre-evaluation")}:</div>
                        <div className="col">{data.deadlineForPreEval}</div>
                        <hr className="my-2" />
                    </div>
                    <div className="row">
                        <div className="col-lg-4">{t("Clearing summary")}:</div>
                        <div className="col">
                            <textarea
                                className='form-control'
                                id='administration.clearingSummary'
                                aria-describedby={t("Clearing summary")}
                                style={{ height: '120px' }}
                                value={data.clearingSummary}
                                readOnly
                            />
                        </div>
                        <hr className="my-2" />
                    </div>
                    <div className="row">
                        <div className="col-lg-4">{t("Special risk Open Source Software")}:</div>
                        <div className="col">
                            <textarea
                                className='form-control'
                                id='administration.specialRiskOSS'
                                aria-describedby={t("Special risk Open Source Software")}
                                style={{ height: '120px' }}
                                value={data.specialRiskOpenSourceSoftware}
                                readOnly
                            />
                        </div>
                        <hr className="my-2" />
                    </div>
                    <div className="row">
                        <div className="col-lg-4">{t("General risks 3rd party software")}:</div>
                        <div className="col">
                            <textarea
                                className='form-control'
                                id='administration.generalRisks3rdPartySoftware'
                                aria-describedby={t("General risks 3rd party software")}
                                style={{ height: '120px' }}
                                value={data.generalRisksThirdPartySoftware}
                                readOnly
                            />
                        </div>
                        <hr className="my-2" />
                    </div>
                    <div className="row">
                        <div className="col-lg-4">{t("Special risks 3rd party software")}:</div>
                        <div className="col">
                            <textarea
                                className='form-control'
                                id='administration.specialRisks3rdPartySoftware'
                                aria-describedby={t("Special risks 3rd party software")}
                                style={{ height: '120px' }}
                                value={data.specialRisksThirdPartySoftware}
                                readOnly
                            />
                        </div>
                        <hr className="my-2" />
                    </div>
                    <div className="row">
                        <div className="col-lg-4">{t("Sales and delivery channels")}:</div>
                        <div className="col">
                            <textarea
                                className='form-control'
                                id='administration.salesAndDeliveryChannels'
                                aria-describedby={t("Sales and delivery channels")}
                                style={{ height: '120px' }}
                                value={data.salesAndDeliveryChannels}
                                readOnly
                            />
                        </div>
                        <hr className="my-2" />
                    </div>
                    <div className="row">
                        <div className="col-lg-4">{t("Remarks additional requirements")}:</div>
                        <div className="col">
                            <textarea
                                className='form-control'
                                id='administration.remarksAdditionalRequirements'
                                aria-describedby={t("Remarks additional requirements")}
                                style={{ height: '120px' }}
                                value={data.remarksAdditionalRequirements}
                                readOnly
                            />
                        </div>
                        <hr className="my-2" />
                    </div>
                </div>
                <div className="row mb-4">
                    <div className="row header mb-2">
                        <h6>{t("Lifecycle")}</h6>
                    </div>
                    <div className="row">
                        <div className="col-lg-4">{t("Project state")}:</div>
                        <div className="col">{Capitalize(data.projectState)}</div>
                        <hr className="my-2" />
                    </div>
                    <div className="row">
                        <div className="col-lg-4">{t("System State Begin")}:</div>
                        <div className="col">{data.systemStateBegin}</div>
                        <hr className="my-2" />
                    </div>
                    <div className="row">
                        <div className="col-lg-4">{t("System State End")}:</div>
                        <div className="col">{data.systemStateEnd}</div>
                        <hr className="my-2" />
                    </div>
                    <div className="row">
                        <div className="col-lg-4">{t("Delivery start")}:</div>
                        <div className="col">{data.deliveryStart}</div>
                        <hr className="my-2" />
                    </div>
                    <div className="row">
                        <div className="col-lg-4">{t("Phase-out since")}:</div>
                        <div className="col">{data.phaseOutSince}</div>
                        <hr className="my-2" />
                    </div>
                </div>
                <div className="row mb-4">
                <div className="row header mb-2">
                    <h6>{t("License Info Header")}</h6>
                </div>
                <div className="row">
                    <div className="col">
                        <textarea
                            className='form-control'
                            id='administration.licenseInfoHeader'
                            aria-describedby={t("License Info Header")}
                            style={{ height: '600px' }}
                            value={data.licenseInfoHeader}
                            readOnly
                        />
                    </div>
                    <hr className="my-2" />
                </div>
            </div>

            </div>
        </>
    )
}