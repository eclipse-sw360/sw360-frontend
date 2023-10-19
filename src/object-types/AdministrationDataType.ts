// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

interface AdministrationDataType {
    // Clearing
    projectClearingState: string
    clearingDetails: string
    clearingTeam: string
    deadlineForPreEval: string
    clearingSummary: string
    specialRiskOpenSourceSoftware: string
    generalRisksThirdPartySoftware: string
    specialRisksThirdPartySoftware: string
    salesAndDeliveryChannels: string
    remarksAdditionalRequirements: string

    // Lifecycle
    projectState: string
    systemStateBegin: string
    systemStateEnd: string
    deliveryStart: string
    phaseOutSince: string

    // LicenseInfoHeader
    licenseInfoHeader: string
}

export default AdministrationDataType
