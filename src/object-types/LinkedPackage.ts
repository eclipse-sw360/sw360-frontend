// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

interface LinkedPackage {
    packageId: string
    packageName: string
    packageVersion: string
    vendorId?: string
    vendorName?: string
    releaseId?: string
    releaseName?: string
    releaseVersion?: string
    releaseClearingState?: string
    licenses?: Array<string>
    packageManager?: string
}

export default LinkedPackage