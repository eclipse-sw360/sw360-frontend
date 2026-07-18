// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.
//
// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/
//
// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useEffect, useMemo, useRef } from 'react'
import {
    buildLoginRedirectPath,
    isProtectedRoute,
    SESSION_EXPIRED_EVENT,
    type SessionExpiredEventDetail,
} from '@/utils/sessionExpiry.utils'

export default function SessionStatusHandler() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const { data: session, status } = useSession()
    const isHandlingSessionRef = useRef(false)

    const currentPathWithSearch = useMemo(() => {
        const query = searchParams.toString()
        return query.length > 0 ? `${pathname}?${query}` : pathname
    }, [
        pathname,
        searchParams,
    ])

    useEffect(() => {
        if (status === 'unauthenticated' && isProtectedRoute(pathname) && !isHandlingSessionRef.current) {
            isHandlingSessionRef.current = true
            router.replace(buildLoginRedirectPath(currentPathWithSearch))
        }
    }, [
        currentPathWithSearch,
        pathname,
        router,
        status,
    ])

    useEffect(() => {
        // Once we are on a non-protected route (typically login), allow future handling cycles.
        if (!isProtectedRoute(pathname)) {
            isHandlingSessionRef.current = false
        }
    }, [
        pathname,
    ])

    useEffect(() => {
        if (
            status === 'authenticated' &&
            session?.user.error === 'RefreshAccessTokenError' &&
            !isHandlingSessionRef.current
        ) {
            isHandlingSessionRef.current = true

            void signOut({
                redirect: false,
            }).finally(() => {
                router.replace(buildLoginRedirectPath(currentPathWithSearch))
            })
        }
    }, [
        currentPathWithSearch,
        router,
        session?.user.error,
        status,
    ])

    useEffect(() => {
        const handleSessionExpired = (event: Event) => {
            if (isHandlingSessionRef.current) {
                return
            }

            isHandlingSessionRef.current = true
            const detail = (event as CustomEvent<SessionExpiredEventDetail>).detail
            const callbackUrl = detail?.callbackUrl ?? currentPathWithSearch

            if (status === 'authenticated') {
                void signOut({
                    redirect: false,
                }).finally(() => {
                    router.replace(buildLoginRedirectPath(callbackUrl))
                })
                return
            }

            router.replace(buildLoginRedirectPath(callbackUrl))
        }

        window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired)
        return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired)
    }, [
        currentPathWithSearch,
        router,
        status,
    ])

    return null
}
