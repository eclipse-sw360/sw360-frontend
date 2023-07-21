// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

"use client"

import Link from "next/link"

export default function Roles() {

    const moderators = ["ashaya.chandrashekara@siemens-healthineers.com", "D. Krishna Prasad", "Sai Raj Devarakonda", "Sujith Manuel", "Vilasa Palleda Jagadish"]
    const securityResponsibles = ["ashaya.chandrashekara@siemens-healthineers.com", "D. Krishna Prasad", "Guruprasad B.G", "Marc Landry K Djamou", "Sai Raj Devarakonda", "Sujith Manuel", "Vilasa Palleda Jagadish"]

    return (
        <>
            <div className="row mb-4">
                <div className="row header mb-2">
                    <h6>Roles</h6>
                </div>
                <div className="row">
                    <div className="col-lg-4">{"Group"}:</div>
                    <div className="col">{"SHS"}</div>
                    <hr className="my-2" />
                </div>
                <div className="row">
                    <div className="col-lg-4">{"Project Responsible"}:</div>
                    <div className="col"><Link className={`text-link`} href="#">{"Dilip Bhaskar"}</Link></div>
                    <hr className="my-2" />
                </div>
                <div className="row">
                    <div className="col-lg-4">{"Project Owner"}:</div>
                    <div className="col"><Link className={`text-link`} href="#">{"ashok.anandaram@siemens-healthineers.com"}</Link></div>
                    <hr className="my-2" />
                </div>
                <div className="row">
                    <div className="col-lg-4">{"Owner Accounting Unit"}:</div>
                    <div className="col"></div>
                    <hr className="my-2" />
                </div>
                <div className="row">
                    <div className="col-lg-4">{"Owner Billing Group"}:</div>
                    <div className="col">{"SHS"}</div>
                    <hr className="my-2" />
                </div>
                <div className="row">
                    <div className="col-lg-4">{"Owner Country"}:</div>
                    <div className="col"></div>
                    <hr className="my-2" />
                </div>
                <div className="row">
                    <div className="col-lg-4">{"Lead Architect"}:</div>
                    <div className="col"><Link className={`text-link`} href="#">{"Sujith Manuel"}</Link></div>
                    <hr className="my-2" />
                </div>
                <div className="row">
                    <div className="col-lg-4">{"Moderators"}:</div>
                    <div className="col">       {
                            moderators.map((elem, i) => { 
                                return (
                                    <><li key={elem} style={{display:"inline"}}><Link className={`text-link`} href="#" key={elem}>{elem}</Link>{(i === moderators.length - 1)?"":","} </li></>
                                )
                            })
                        }
                    </div>
                    <hr className="my-2" />
                </div>
                <div className="row">
                    <div className="col-lg-4">{"Contributors"}:</div>
                    <div className="col"></div>
                    <hr className="my-2" />
                </div>
                <div className="row">
                    <div className="col-lg-4">{"Security Responsibles"}:</div>
                    <div className="col">        
                        {
                            securityResponsibles.map((elem, i) => { 
                                return (
                                    <><li key={elem} style={{display:"inline"}}><Link className={`text-link`} href="#">{elem}</Link>{(i === securityResponsibles.length - 1)?"":","} </li></>
                                )
                            })
                        }
                    </div>
                    <hr className="my-2" />
                </div>
                <div className="row">
                    <div className="col-lg-4">{"Additional Roles"}:</div>
                    <div className="col"></div>
                    <hr className="my-2" />
                </div>
            </div>
        </>
    )
}