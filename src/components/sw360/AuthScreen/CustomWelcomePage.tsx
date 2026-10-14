// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { type JSX, useEffect, useRef } from 'react'
import { createWelcomePageSrcDoc } from '@/utils/customWelcomePage.utils'

interface CustomWelcomePageProps {
    html: string
    title: string
}

export default function CustomWelcomePage({ html, title }: CustomWelcomePageProps): JSX.Element {
    const frameRef = useRef<HTMLIFrameElement>(null)

    useEffect(() => {
        const frame = frameRef.current
        if (!frame) return

        let observer: ResizeObserver | undefined
        const fitContent = (): void => {
            observer?.disconnect()
            const body = frame.contentDocument?.body
            if (!body) return

            const resize = (): void => {
                frame.height = String(Math.ceil(body.getBoundingClientRect().height))
            }
            resize()
            observer = new ResizeObserver(resize)
            observer.observe(body)
        }

        frame.addEventListener('load', fitContent)
        frame.srcdoc = createWelcomePageSrcDoc(html, getComputedStyle(frame))
        return () => {
            frame.removeEventListener('load', fitContent)
            observer?.disconnect()
        }
    }, [
        html,
    ])

    return (
        <iframe
            ref={frameRef}
            title={title}
            className='custom-welcome-frame w-100 border-0'
            height='1'
            // Allow parent-side sizing, but never allow scripts in the iframe.
            sandbox='allow-popups allow-same-origin'
            referrerPolicy='no-referrer'
        />
    )
}
