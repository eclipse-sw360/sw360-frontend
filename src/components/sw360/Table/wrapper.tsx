// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/no-unsafe-argument */

'use client'
import { Component as gComponent, createRef as gCreateRef, h } from 'gridjs'
import { createRoot } from 'react-dom/client'

export class ReactWrapper extends gComponent<{
    element: any
    parent?: string
}> {
    static defaultProps = {
        parent: 'div',
    }

    ref = gCreateRef()

    componentDidMount(): void {
        const root = createRoot(this.ref.current)
        root.render(this.props.element)
    }

    render() {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        return h(this.props.parent, { ref: this.ref })
    }
}

export function _(element: any, parent?: string) {
    return h(ReactWrapper, {
        element: element,
        parent: parent,
    })
}
