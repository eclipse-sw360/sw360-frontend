// Copyright (C) TOSHIBA CORPORATION, 2025. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { Configuration } from '@/object-types'
import { Dispatch, SetStateAction, type JSX } from 'react'

interface SwitchProps {
    size: number,
    checked: boolean,
    setCurrentConfig: Dispatch<SetStateAction<Configuration | undefined>>,
    propKey: string,
}

const OnOffSwitch = ({ size, checked, setCurrentConfig, propKey }: SwitchProps): JSX.Element => {
    return (
        <div >
            <span className='align-middle fw-bold p-2'>OFF</span>
            <label className='switch' style={{ height: size, width: size * 2 }}>
                <input type='checkbox' defaultChecked={checked} onChange={(event) => {
                    setCurrentConfig((prev) => {
                        return {
                            ...prev,
                            [propKey]: event.target.checked.toString()
                        } as Configuration
                    })
                }}
                />
                <span className='slider round' style={{ borderRadius: size }}></span>
            </label>
            <span className='align-middle fw-bold p-2'>ON</span>
        </div>
    )
}

export default OnOffSwitch