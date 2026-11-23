// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { useDocumentTitle } from './useDocumentTitle'
import useLocalStorage from './useLocalStorage'
import useStoredWarning, {
    COMPONENT_NOT_FOUND_WARNING_KEY,
    consumeWarning,
    LAST_RELEASE_COMPONENT_ID_KEY,
    PROJECT_NOT_FOUND_WARNING_KEY,
    RELEASE_NOT_FOUND_WARNING_KEY,
    redirectWithWarning,
} from './useStoredWarning'
import { useSW360BackendConfig } from './useSW360BackendConfig'
import { useUiConfig } from './useUiConfig'

export {
    COMPONENT_NOT_FOUND_WARNING_KEY,
    consumeWarning,
    LAST_RELEASE_COMPONENT_ID_KEY,
    PROJECT_NOT_FOUND_WARNING_KEY,
    RELEASE_NOT_FOUND_WARNING_KEY,
    redirectWithWarning,
    useDocumentTitle,
    useLocalStorage,
    useStoredWarning,
    useSW360BackendConfig,
    useUiConfig,
}
