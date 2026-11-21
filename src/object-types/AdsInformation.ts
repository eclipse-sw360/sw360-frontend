// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

export interface AdsInformationReleaseSummary {
    releaseId: string
    releaseName: string
    version: string
}

export interface AdsInformationCandidateRelease extends AdsInformationReleaseSummary {
    changedFilesCount: number
}

export interface AdsInformationClearingAssessment {
    clearingRequired: boolean
    clxAutoUpdateRequired: boolean | null
    licenseChangesCount: number
    copyrightChangesCount: number
    deletedFilesCount: number
    renamedFilesCount: number
}

export type AdsInformationRowValue = string | number | boolean | null

export type AdsInformationRow = Record<string, AdsInformationRowValue>

export interface AdsInformation {
    attachmentContentId: string
    attachmentFilename: string
    candidateRelease: AdsInformationCandidateRelease
    baseRelease: AdsInformationReleaseSummary
    clearingAssessment: AdsInformationClearingAssessment
    licenseChanges: Array<AdsInformationRow>
    copyrightChanges: Array<AdsInformationRow>
    deletedFiles: Array<AdsInformationRow>
    renamedFiles: Array<AdsInformationRow>
}
