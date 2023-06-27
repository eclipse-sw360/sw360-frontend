// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

/* eslint-disable @typescript-eslint/no-explicit-any */

import { h, createRef as gCreateRef, Component as gComponent } from 'gridjs'
import ReactDOM from 'react-dom'

export class ReactWrapper extends gComponent<{
    element: any
    parent?: string
}> {
    static defaultProps = {
        parent: 'div',
    }

    ref = gCreateRef()

    componentDidMount(): void {
        ReactDOM.render(this.props.element, this.ref.current)
    }

    render() {
        return h(this.props.parent, { ref: this.ref })
    }
}

export function _(element: any, parent?: string) {
    return h(ReactWrapper, {
        element: element,
        parent: parent,
    })
}
