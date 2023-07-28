// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import React from 'react'
import { useTranslations } from 'next-intl'
import { COMMON_NAMESPACE } from '@/object-types/Constants'

export default function TiltleAttachment() {
    const t = useTranslations(COMMON_NAMESPACE)
    return (
        <>
            <div style={{ border: '1px solid #969696', backgroundColor: '#5D8EA9' }}>
                <div style={{ height: '30px', border: '1px ' }}>
                    <p style={{ textAlign: 'justify' }}>Attachments</p>
                </div>
                <div style={{ float: 'left' }}>
                    <div style={{ textAlign: 'left', height: '92px', width: '250px', float: 'left' }}>
                        <p style={{}}>Filename</p>
                    </div>
                    <div style={{ height: '92px', width: '150px', float: 'left' }}>Type</div>
                    <div style={{ height: '92px', width: '500px', float: 'left' }}>
                        <div style={{ height: '45px', width: '500px', float: 'left' }}>Upload</div>
                        <div style={{ height: '45px', width: '500px', float: 'left' }}>
                            <div style={{ height: '45px', width: '125px', float: 'left' }}>Commnet</div>
                            <div style={{ height: '45px', width: '125px', float: 'left' }}>Group</div>
                            <div style={{ height: '45px', width: '125px', float: 'left' }}>Name</div>
                            <div style={{ height: '45px', width: '125px', float: 'left' }}>Date</div>
                        </div>
                    </div>
                    <div style={{ height: '92px', width: '500px', float: 'left' }}>
                        <div style={{ height: '45px', width: '500px', float: 'left' }}>Approval</div>
                        <div style={{ height: '45px', width: '500px', float: 'left' }}>
                            <div style={{ height: '45px', width: '100px', float: 'left' }}>Status</div>
                            <div style={{ height: '45px', width: '100px', float: 'left' }}>Comment</div>
                            <div style={{ height: '45px', width: '100px', float: 'left' }}>Group</div>
                            <div style={{ height: '45px', width: '100px', float: 'left' }}>Name</div>
                            <div style={{ height: '45px', width: '100px', float: 'left' }}>Date</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
