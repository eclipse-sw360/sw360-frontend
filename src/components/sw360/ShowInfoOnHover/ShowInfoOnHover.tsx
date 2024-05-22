// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import { FaInfoCircle } from 'react-icons/fa'

const ShowInfoOnHover = ({ text }: { text: string }) => {
    return (
        <>
            <OverlayTrigger overlay={<Tooltip>{text}</Tooltip>}>
                <span className='d-inline-block'>
                    <FaInfoCircle />
                </span>
            </OverlayTrigger>
        </>
    )
}

export default ShowInfoOnHover
