// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import Link from 'next/link'
import React from 'react'
import styles from '../css/footer.module.css'
import 'bootstrap/dist/css/bootstrap.css';

export default function Footer() {
    return (
        <>
            <footer className= "footer--pin text-center text-white" style={{ "backgroundColor": "#30313F", position: "relative", bottom: '0px', width : '100%'}}>
                <div className={`"container" ${styles.container}`}>
                    <div className={`${styles.poweredBy} "pt-3"`}>
                        Powered-by
                        <Link className = {styles.footerHref} href="http://www.github.com/eclipse/sw360" rel="noopener noreferrer" target="_blank"> SW360</Link> |
                        <Link className = {styles.footerHref} href="/resource/mkdocs/index.html" rel="noopener noreferrer" target="_blank"> SW360 Docs</Link>  |
                        <Link className = {styles.footerHref} href="/resource/docs/api-guide.html" rel="noopener noreferrer" target="_blank"> REST API Docs</Link>  |
                        <Link className = {styles.footerHref} href="https://wiki.siemenos.com/display/en/SW360+RESTful+API" rel="noopener noreferrer" target="_blank"> REST API Access</Link>  |
                        <Link className = {styles.footerHref} href="https://github.com/eclipse/sw360/issues" rel="noopener noreferrer" target="_blank"> Public Issue Tracker</Link>  |
                        <Link className = {styles.footerHref} href="https://code.siemens.com/sw360/sw360portal/issues" rel="noopener noreferrer" target="_blank"> Siemens Issue Tracker</Link>  |
                        <Link className = {styles.footerHref} href="https://wiki.siemens.com/pages/viewpage.action?pageId=61346243" rel="noopener noreferrer" target="_blank"> Siemens Wiki</Link>
                    </div>
                </div>
                <div className={`${styles.footerBottom}`}>
                    Version: 17.0.0-SNAPSHOT | Branch: masterct (f69a224) | Build time: 2023-01-29T14:25:37Z
                </div>
            </footer>
        </>
    )
}
