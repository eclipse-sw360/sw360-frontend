// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import React, { useState } from 'react'
import Link from 'next/link'
import {useRouter} from 'next/router'
import sw360logo from '../../public/images/logo-edited.svg'
import sw360ProfileIcon from '../../public/images/profile.svg'
import Image from 'next/image'
import navbarStyles from '../css/navbar.module.css'
import 'bootstrap/dist/css/bootstrap.css';




export default function Navbar() {

    const location = useRouter();

    const [inputValue, setInputValue] = useState('')
    const [heading, setHeading] = useState('')

    const initiateSearch = () => {
        console.log("Search button is clicked !", inputValue)
    }

    const getSearchedKeyword = (event:any) => {
        setInputValue(event.target.value);
    }

    const handleHeading = (event:any) => {
        setHeading(event.target.innerText);
    }

    return (
        <div>
            <div className='container-fluid pt-4 pb-2'>
                <div className='row'>
                    <div className='col-md-4'>
                        <Link className='container' href='/'>
                            <Image src={sw360logo} height={57} width={147} alt="SW360 Logo" />
                        </Link>
                    </div>
                    <div className="col-md-5 col-md-offset-1"></div>
                    <div className='col-md-2 pt-3'>
                        <form className="d-flex input-group w-auto">
                            <input
                                type="text"
                                className="form-control rounded"
                                placeholder="Search..."
                                value={inputValue}
                                onChange={getSearchedKeyword}
                            />
                            <button className="input-group-text text-white border-0" type="submit"
                                    id="search-addon" onClick={initiateSearch}>
                                <i className="fas fa-search" style={{ color: "black" }}></i>
                            </button>
                        </form>
                    </div>
                    <div className="col-md-1 pt-1" style={{float: "left"}}>
                        <div className="dropdown show">
                            <button className={`btn dropdown-toggle ${navbarStyles.dropdownToggle}`} style={{border: "transparent"}}
                                id="dropdownMenuLink" data-bs-toggle="dropdown" aria-expanded="false">
                                <Image className={navbarStyles.profileImage} src={sw360ProfileIcon} alt='Profile'/>
                            </button>

                            <div className={`dropdown-menu ${navbarStyles.dropdownMenu}`}>
                                <li><Link className="dropdown-item" href="/mySites">My Sites</Link></li>
                                <li><Link className="dropdown-item" href="/myProfile">My Profile</Link></li>
                                <li><Link className="dropdown-item" href="/myDashboard">My Dashboard </Link></li>
                                <li><hr className="dropdown-divider"/></li>
                                <li><Link className="dropdown-item" href="/notifications">Notifications</Link></li>
                                <li><Link className="dropdown-item" href="/sharedContent">Shared Content</Link></li>
                                <li><Link className="dropdown-item" href="/mySubmissions">My Submissions</Link></li>
                                <li><Link className="dropdown-item" href="/myWorkflowTasks">My Workflow Tasks</Link></li>
                                <li><hr className="dropdown-divider"/></li>
                                <li><Link className="dropdown-item" href="/accountSettings">Account Settings</Link></li>
                                <li><Link className="dropdown-item" href="/myConnectedApplications">My Connected Applications</Link></li>
                                <li><Link className="dropdown-item" href="/myOrganizations">My Organizations</Link></li>
                                <li><hr className="dropdown-divider"/></li>
                                <li><Link className="dropdown-item" href="/signOut">Sign Out</Link></li>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <nav className="navbar navbar-expand-lg bg-light">
                <div className="container-fluid">
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent"
                        aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className={`collapse navbar-collapse ${navbarStyles.navbarCollapse}`} id="navbarSupportedContent">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item mx-2">
                                <Link className={`nav-link  ${location.pathname === "/" ? "active" : ""}`} href="/home" onClick={handleHeading}><b>Home</b></Link>
                                <div className={navbarStyles.underline}></div>
                            </li>
                            <li className="nav-item mx-1">
                                <Link className={`nav-link ${location.pathname === "/projects" ? "active" : ""}`} href="/projects" onClick={handleHeading}><b>Projects</b></Link>
                                <div className={navbarStyles.underline}></div>
                            </li>
                            <li className="nav-item mx-1">
                                <Link className={`nav-link ${location.pathname === "/components" ? "active" : ""}`} href="/components" onClick={handleHeading}><b>Components</b></Link>
                                <div className={navbarStyles.underline}></div>
                            </li>
                            <li className="nav-item mx-1">
                                <Link className={`nav-link ${location.pathname === "/licenses" ? "active" : ""}`} href="/licenses" onClick={handleHeading}><b>Licenses</b></Link>
                                <div className={navbarStyles.underline}></div>
                            </li>
                            <li className="nav-item mx-1">
                                <Link className={`nav-link ${location.pathname === "/ecc" ? "active" : ""}`} href="/ecc" onClick={handleHeading}><b>ECC</b></Link>
                                <div className={navbarStyles.underline}></div>
                            </li>
                            <li className="nav-item mx-1">
                                <Link className={`nav-link ${location.pathname === "/vulnerabilities" ? "active" : ""}`} href="/vulnerabilities" onClick={handleHeading}><b>Vulnerabilities</b></Link>
                                <div className={navbarStyles.underline}></div>
                            </li>
                            <li className="nav-item mx-1">
                                <Link className={`nav-link ${location.pathname === "/requests" ? "active" : ""}`} href="/requests" onClick={handleHeading}><b>Requests</b></Link>
                                <div className={navbarStyles.underline}></div>
                            </li>
                            <li className="nav-item mx-1">
                                <Link className={`nav-link ${location.pathname === "/search" ? "active" : ""}`} href="/search" onClick={handleHeading}><b>Search</b></Link>
                                <div className={navbarStyles.underline}></div>
                            </li>
                            <li className="nav-item mx-1">
                                <Link className={`nav-link ${location.pathname === "/preferences" ? "active" : ""}`} href="/preferences" onClick={handleHeading}><b>Preferences</b></Link>
                                <div className={navbarStyles.underline}></div>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
            <div className={`container-fluid ${navbarStyles.headingDiv}`}>
                <div className={`row px-3 pt-2 ${navbarStyles.headingContentDiv}`}>
                <h6><b>{heading}</b></h6>
                </div>
            </div>
        </div>
    )
}
