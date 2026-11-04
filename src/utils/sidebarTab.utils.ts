// Copyright (C) Gauransh Ahuja, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import type { MouseEvent } from 'react'

interface SidebarTabLinkProps {
    eventKey: string
    href: string
    onClick: (event: MouseEvent<HTMLElement>) => void
}

/**
 * Props for a `ListGroup.Item action` in a `Tab.Container` sidebar whose active tab is kept in the
 * `?tab=` query parameter.
 *
 * With an `href` the item renders as a link instead of a button, so Ctrl/Cmd+Click, middle click
 * and the context menu's "Open Link in New Tab" open the tab in a new browser tab. A plain left
 * click still switches the tab in place through the container's `onSelect`, without a reload.
 */
export function sidebarTabLinkProps(tabKey: string): SidebarTabLinkProps {
    return {
        eventKey: tabKey,
        href: `?tab=${tabKey}`,
        onClick: (event) => {
            // A modified or non-primary click belongs to the browser (new tab, new window), so
            // stop it here before the container's `onSelect` switches this page's tab as well
            if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
                event.stopPropagation()
                return
            }
            // A plain left click switches the tab in place, so the link must not navigate
            event.preventDefault()
        },
    }
}
