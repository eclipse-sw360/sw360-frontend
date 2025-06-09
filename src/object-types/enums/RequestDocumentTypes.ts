// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

enum RequestDocumentTypes {
    COMPONENT = 'COMPONENT',
    PROJECT = 'PROJECT',
    RELEASE = 'RELEASE',
    LICENSE = 'LICENSE',
    COMPONENT_ADDITION = 'componentAdditions',
    COMPONENT_DELETION = 'componentDeletions',
    LICENSE_ADDITION = 'licenseAdditions',
    LICENSE_DELETION = 'licenseDeletions',
    PROJECT_ADDITION = 'projectAdditions',
    PROJECT_DELETION = 'projectDeletions',
    RELEASE_ADDITION = 'releaseAdditions',
    RELEASE_DELETION = 'releaseDeletions',
}

export default RequestDocumentTypes
