// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { ReactNode } from 'react'

export interface PageButtonHeaderProps {
    title?: string
    buttons?: {
        [key: string]: ButtonProps
    }
    children?: ReactNode
    checked?: boolean
    changesLogTab?: string
    changeLogId?: string
    setChangesLogTab?: (key: string) => void
}

interface ButtonProps {
    link: string
    name: string
    type: string
    onClick?: (event: React.MouseEvent<HTMLElement>) => void
    disable?: boolean
    hidden?: boolean
}
