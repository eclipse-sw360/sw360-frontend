// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

"use client"

import { OverlayTrigger, Tooltip } from "react-bootstrap"
import { BiClipboard } from "react-icons/bi"
import Link from "next/link"
import { useTranslations } from 'next-intl'
import { COMMON_NAMESPACE } from '@/object-types/Constants'

import { SummaryDataType } from '@/object-types/SummaryDataType'

export default function Summary({ summaryData }: { summaryData: SummaryDataType }) {

    const t = useTranslations(COMMON_NAMESPACE)     

    const Clipboard = ({text}: {text: string}) => {
        return (
            <>
                <OverlayTrigger overlay={<Tooltip>{t('Copy to Clipboard')}</Tooltip>}>
                    <span className="d-inline-block">
                        <BiClipboard onClick={() => {navigator.clipboard.writeText(text)}}/>
                    </span>
                </OverlayTrigger>
          </>
        );
    }; 

    return (
        <>
            <p className="mt-3 mb-4 px-0 mx-0">{summaryData.description}</p>
            <div className="ms-3 me-2">
                <div className="row mb-4">
                    <div className="row header mb-2">
                        <h6>{t('General Information')}</h6>
                    </div>
                    <div className="row">
                        <div className="col-lg-4">{t('Id')}:</div>
                        <div className="col">{summaryData.id} <Clipboard text={summaryData.id}/></div>
                        <hr className="my-2" />
                    </div>
                    <div className="row">
                        <div className="col-lg-4">{t("Name")}:</div>
                        <div className="col">{summaryData.name}</div>
                        <hr className="my-2" />
                    </div>
                    <div className="row">
                        <div className="col-lg-4">{t("Version")}:</div>
                        <div className="col">{summaryData.version}</div>
                        <hr className="my-2" />
                    </div>
                    <div className="row">
                        <div className="col-lg-4">{t("Visibility")}:</div>
                        <div className="col">{summaryData.visibility.charAt(0) + summaryData.visibility.slice(1).toLowerCase()}</div>
                        <hr className="my-2" />
                    </div>
                    <div className="row">
                        <div className="col-lg-4">{t("Created On")}:</div>
                        <div className="col">{summaryData.createdOn}</div>
                        <hr className="my-2" />
                    </div>
                    <div className="row">
                        <div className="col-lg-4">{t("Created By")}:</div>
                        <div className="col"><Link className={`text-link`} href={`mailto:${summaryData.createdBy.email}`}>{summaryData.createdBy.name}</Link></div>
                        <hr className="my-2" />
                    </div>
                    <div className="row">
                        <div className="col-lg-4">{t("Modified On")}:</div>
                        <div className="col">{summaryData.modifiedOn}</div>
                        <hr className="my-2" />
                    </div>
                    <div className="row">
                        <div className="col-lg-4">{t("Modified By")}:</div>
                        <div className="col"><Link className={`text-link`} href={`mailto:${summaryData.modifiedBy.email}`}>{summaryData.modifiedBy.name}</Link></div>
                        <hr className="my-2" />
                    </div>
                    <div className="row">
                        <div className="col-lg-4">{t("Project Type")}:</div>
                        <div className="col">{summaryData.projectType.charAt(0) + summaryData.projectType.slice(1).toLowerCase()}</div>
                        <hr className="my-2" />
                    </div>
                    <div className="row">
                        <div className="col-lg-4">{t("Domain")}:</div>
                        <div className="col">{summaryData.domain}</div>
                        <hr className="my-2" />
                    </div>
                    <div className="row">
                        <div className="col-lg-4">{t("Tag")}:</div>
                        <div className="col">{summaryData.tag}</div>
                        <hr className="my-2" />
                    </div>
                    <div className="row">
                        <div className="col-lg-4">{t("External Ids")}:</div>
                        <div className="col">
                            <ul className="ps-3">
                                {
                                    Array.from(summaryData.externalIds).map(([name, value]) => <li key={name}><span className="fw-bold">{name}</span> {value}</li>)
                                }
                            </ul>
                        </div>
                        <hr className="my-2" />
                    </div>
                    <div className="row">
                        <div className="col-lg-4">{t("Additional Data")}:</div>
                        <div className="col">        
                            <ul className="ps-3">
                                {
                                    Array.from(summaryData.additionalData).map(([name, value]) => <li key={name}><span className="fw-bold">{name}</span> {value}</li>)
                                }
                            </ul>
                        </div>
                        <hr className="my-2" />
                    </div>
                    <div className="row">
                        <div className="col-lg-4">{t("External URLs")}:</div>
                        <div className="col">
                            <ul className="ps-3">
                                {
                                    Array.from(summaryData.externalUrls).map(([name, value]) => <li key={name}><span className="fw-bold">{name}</span>{" "} 
                                    <Link className="text-link" href={`mailto:${value}`}>{value}</Link></li>)
                                }
                            </ul>  
                        </div>
                        <hr className="my-2" />
                    </div>
                </div>
                <div className="row mb-4">
                    <div className="row header mb-2">
                        <h6>{t("Roles")}</h6>
                    </div>
                    <div className="row">
                        <div className="col-lg-4">{t("Group")}:</div>
                        <div className="col">{summaryData.group}</div>
                        <hr className="my-2" />
                    </div>
                    <div className="row">
                        <div className="col-lg-4">{t("Project Responsible")}:</div>
                        <div className="col"><Link className="text-link" href={`mailto:${summaryData.projectResponsible.email}`}>{summaryData.projectResponsible.name}</Link></div>
                        <hr className="my-2" />
                    </div>
                    <div className="row">
                        <div className="col-lg-4">{t("Project Owner")}:</div>
                        <div className="col"><Link className="text-link" href={`mailto:${summaryData.projectOwner.email}`}>{summaryData.projectOwner.name}</Link></div>
                        <hr className="my-2" />
                    </div>
                    <div className="row">
                        <div className="col-lg-4">{t("Owner Accounting Unit")}:</div>
                        <div className="col">{summaryData.ownerAccountingUnit}</div>
                        <hr className="my-2" />
                    </div>
                    <div className="row">
                        <div className="col-lg-4">{t("Owner Billing Group")}:</div>
                        <div className="col">{summaryData.ownerBillingGroup}</div>
                        <hr className="my-2" />
                    </div>
                    <div className="row">
                        <div className="col-lg-4">{t("Owner Country")}:</div>
                        <div className="col">{new Intl.DisplayNames(['en'], {type: 'region'}).of(summaryData.ownerCountry)}</div>
                        <hr className="my-2" />
                    </div>
                    <div className="row">
                        <div className="col-lg-4">{t("Lead Architect")}:</div>
                        <div className="col"><Link className="text-link" href={`mailto:${summaryData.leadArchitect.email}`}>{summaryData.leadArchitect.name}</Link></div>
                        <hr className="my-2" />
                    </div>
                    <div className="row">
                        <div className="col-lg-4">{t("Moderators")}:</div>
                        <div className="col">       
                            {
                                summaryData.moderators.map((elem, i) => <li key={elem.email} style={{display:"inline"}}><Link className="text-link" href={`mailto:${elem.email}`} key={elem.email}>{elem.name}</Link>{(i === summaryData.moderators.length - 1)?"":","} </li>)
                            }
                        </div>
                        <hr className="my-2" />
                    </div>
                    <div className="row">
                        <div className="col-lg-4">{t("Contributors")}:</div>
                        <div className="col">
                            {
                                summaryData.contributors.map((elem, i) => <li key={elem.email} style={{display:"inline"}}><Link className="text-link" href={`mailto:${elem.email}`} key={elem.email}>{elem.name}</Link>{(i === summaryData.contributors.length - 1)?"":","} </li>)
                            }
                        </div>
                        <hr className="my-2" />
                    </div>
                    <div className="row">
                        <div className="col-lg-4">{t("Security Responsibles")}:</div>
                        <div className="col">        
                            {
                                summaryData.securityResponsibles.map((elem, i) => <li key={elem.email} style={{display:"inline"}}><Link className="text-link" href={`mailto:${elem.email}`} key={elem.email}>{elem.name}</Link>{(i === summaryData.securityResponsibles.length - 1)?"":","} </li>)
                            }
                        </div>
                        <hr className="my-2" />
                    </div>
                    <div className="row">
                        <div className="col-lg-4">{t("Additional Roles")}:</div>
                        <div className="col">
                            {
                                Array.from(summaryData.additionalRoles).map(([name, value]) => <li key={name}><span className="fw-bold">{name}</span> <Link className="text-link" href={`mailto:${value}`}>{value}</Link></li>)
                            }
                        </div>
                        <hr className="my-2" />
                    </div>
                </div>
                <div className="row mb-4">
                    <div className="row header mb-2">
                        <h6>{t("Project Version")}</h6>
                    </div>
                    <div className="row">
                        <div className="col-lg-4">{t("Full Name")}:</div>
                        <div className="col">{summaryData.vendorFullName}</div>
                        <hr className="my-2" />
                    </div>
                    <div className="row">
                        <div className="col-lg-4">{t("Short Name")}:</div>
                        <div className="col">{summaryData.vendorShortName}</div>
                        <hr className="my-2" />
                    </div>
                    <div className="row">
                        <div className="col-lg-4">{t("URL")}:</div>
                        <div className="col">{summaryData.vendorUrl}</div>
                        <hr className="my-2" />
                    </div>
                </div>
            </div>
            
        </>
    )
}