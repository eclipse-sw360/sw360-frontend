// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

export interface PageableQueryParam {
    page: number
    page_entries: number
    sort: string
}

export interface PaginationMeta {
    size: number
    totalElements: number
    totalPages: number
    number: number
}

export interface ColumnMeta {
    width?: string
}
