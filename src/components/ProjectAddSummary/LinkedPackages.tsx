// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'


export default function LinkedPackages(): JSX.Element {

    return (
        <>
            <div className='row mb-4'>
                <div className='col-lg-4'>
                    <button
                        type='button'
                        className='btn btn-secondary'>
                        Add Packages
                    </button>
                </div>
                <div style={{ paddingLeft: '0px' }}>
                </div>
            </div>
        </>
    )
}
