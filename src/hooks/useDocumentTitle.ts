// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useEffect } from 'react'

export function useDocumentTitle(title: string | undefined): void {
    useEffect(() => {
        if (!title) {
            return
        }

        document.title = title

        // Next.js re-applies the static route `metadata` title on in-page
        // navigations (e.g. switching tabs via `?tab=`). Watch <head> and
        // restore our title whenever it gets changed back.
        const observer = new MutationObserver(() => {
            if (document.title !== title) {
                document.title = title
            }
        })
        observer.observe(document.head, {
            childList: true,
            subtree: true,
            characterData: true,
        })

        return () => observer.disconnect()
    }, [
        title,
    ])
}
