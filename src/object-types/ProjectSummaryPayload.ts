// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

interface ProjectSummaryPayload {
    name: string
    version?: string
    visibility?: string
    createdBy?: string
    projectType?: string
    tag?: string
    description?: string
    domain?: string
    defaultVendorId?: string
    modifiedOn?: string
    modifiedBy?: string
    roles?: { [k: string]: Array<string> }
    externalUrls?: { [k: string]: string }
    additionalData?: { [k: string]: string }
    externalIds?: { [k: string]: string }
}

export default ProjectSummaryPayload
