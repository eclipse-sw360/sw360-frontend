// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

export interface FileList {
    licName: string
    srcFiles: string[]
    licSpdxId: string
    licType: string
}

export interface SrcFileList {
    data: FileList[]
    attName: string
    relName: string
}
