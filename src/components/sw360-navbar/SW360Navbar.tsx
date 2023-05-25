// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.
// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

"use client"
import Link from 'next/link'
import navbarStyles from './SW360Navbar.module.css'
import { usePathname } from 'next/navigation'
import { LOCALES as locales } from '@/object-types/Constants';

function SW360Navbar() {
    const pathname = usePathname();
    const isLoginPage = locales.includes(pathname.substring(1))

    return (
        (!isLoginPage) && <div>
            <nav className="navbar navbar-expand-lg">
                <div className="container-fluid">
                    <div className={`collapse navbar-collapse ${navbarStyles.navbarCollapse}`} id="navbarSupportedContent">
                        <ul className="navbar-nav me-auto ">
                            <li className="nav-item mx-2">
                                <Link className={`nav-link`} href="/home"><b>Home</b></Link>
                                <div className={navbarStyles.underline}></div>
                            </li>
                            <li className="nav-item mx-1">
                                <Link className={`nav-link`} href="/projects"><b>Projects</b></Link>
                                <div className={navbarStyles.underline}></div>
                            </li>
                            <li className="nav-item mx-1">
                                <Link className={`nav-link`} href="/components"><b>Components</b></Link>
                                <div className={navbarStyles.underline}></div>
                            </li>
                            <li className="nav-item mx-1">
                                <Link className={`nav-link`} href="/licenses"><b>Licenses</b></Link>
                                <div className={navbarStyles.underline}></div>
                            </li>
                            <li className="nav-item mx-1">
                                <Link className={`nav-link`} href="/ecc"><b>ECC</b></Link>
                                <div className={navbarStyles.underline}></div>
                            </li>
                            <li className="nav-item mx-1">
                                <Link className={`nav-link`} href="/vulnerabilities"><b>Vulnerabilities</b></Link>
                                <div className={navbarStyles.underline}></div>
                            </li>
                            <li className="nav-item mx-1">
                                <Link className={`nav-link`} href="/requests"><b>Requests</b></Link>
                                <div className={navbarStyles.underline}></div>
                            </li>
                            <li className="nav-item mx-1">
                                <Link className={`nav-link`} href="/search"><b>Search</b></Link>
                                <div className={navbarStyles.underline}></div>
                            </li>
                            <li className="nav-item mx-1">
                                <Link className={`nav-link`} href="/preferences"><b>Preferences</b></Link>
                                <div className={navbarStyles.underline}></div>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </div>
    )
}

export default SW360Navbar