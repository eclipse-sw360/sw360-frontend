// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.
// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { useState, MouseEvent } from 'react'
import Link from 'next/link'
import {useRouter} from 'next/router'
import navbarStyles from './SW360Navbar.module.css'

function SW360Navbar() {

    const location = useRouter();
    const [heading, setHeading] = useState('')

    const handleHeading = (event: MouseEvent<HTMLAnchorElement>) => {
        setHeading(event.currentTarget.innerText);
    }

    return (
        <div>
            <nav className="navbar navbar-expand-lg">
                <div className="container-fluid">
                    <div className={`collapse navbar-collapse ${navbarStyles.navbarCollapse}`} id="navbarSupportedContent">
                        <ul className="navbar-nav me-auto ">
                            <li className="nav-item mx-2">
                                <Link className={`nav-link ${location.pathname === "/" ? "" : ""}`} href="/home" onClick={handleHeading}><b>Home</b></Link>
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
            <div className={navbarStyles.headingDiv}>
                <div>{heading}</div>
            </div>
        </div>
    )
}

export default SW360Navbar