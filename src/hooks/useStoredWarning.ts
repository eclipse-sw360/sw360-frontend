// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useTranslations } from 'next-intl'
import { useEffect } from 'react'
import MessageService from '@/services/message.service'

const redirectWithWarning = (storageKey: string, targetPath: string): void => {
    window.sessionStorage.setItem(storageKey, 'true')
    window.location.assign(targetPath)
}

const consumeWarning = (storageKey: string): boolean => {
    const shouldShowWarning = window.sessionStorage.getItem(storageKey) === 'true'

    if (!shouldShowWarning) {
        return false
    }

    window.sessionStorage.removeItem(storageKey)
    return true
}

export const PROJECT_NOT_FOUND_WARNING_KEY = 'project-not-found-warning'
export const COMPONENT_NOT_FOUND_WARNING_KEY = 'component-not-found-warning'
export const RELEASE_NOT_FOUND_WARNING_KEY = 'release-not-found-warning'
export const LAST_RELEASE_COMPONENT_ID_KEY = 'last-release-component-id'

const useStoredWarning = (storageKey: string, translationKey: string): void => {
    const t = useTranslations('default')

    useEffect(() => {
        if (!consumeWarning(storageKey)) {
            return
        }

        MessageService.warn(t(translationKey), {
            autoClose: false,
        })
    }, [
        storageKey,
        t,
        translationKey,
    ])
}

export { consumeWarning, redirectWithWarning }
export default useStoredWarning
