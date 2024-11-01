// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { ReactNode } from 'react'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import { FaInfoCircle } from 'react-icons/fa'

const ShowInfoOnHover = ({ text }: { text: string | ReactNode}) : JSX.Element => {
    return (
        <>
            <OverlayTrigger overlay={<Tooltip>{text}</Tooltip>} placement='bottom'>
                <span className='d-inline-block'>
                    <FaInfoCircle size={13}/>
                </span>
            </OverlayTrigger>
        </>
    )
}

export default ShowInfoOnHover
