// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE


export default interface ProjectPayload {
    name: string
    description?: string
    version?: string
    visibility: string
    projectType: string
    tag?: string
    domain?: string
    leadArchitect?: string
    defaultVendorId?: string
    externalUrls?: object
    externalIds?: object
    additionalData?: object
    state: string
    phaseOutSince?: string
    moderators?: string[]
    contributors?: string[]
    clearingState?: string
    businessUnit ?: string
    preevaluationDeadline ?: string
    clearingSummary ?: string
    specialRisksOSS ?: string
    generalRisks3rdParty ?: string
    specialRisks3rdParty ?: string
    deliveryChannels ?: string
    remarksAdditionalRequirements ?: string
    systemTestStart ?: string
    systemTestEnd ?: string
    deliveryStart ?: string
    licenseInfoHeaderText ?: string
}
