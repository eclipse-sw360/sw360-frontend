// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

enum ReleaseRelationship {
    CONTAINED = 'CONTAINED',
    REFERRED = 'REFERRED',
    UNKNOWN = 'UNKNOWN',
    DYNAMICALLY_LINKED = 'DYNAMICALLY_LINKED',
    STATICALLY_LINKED = 'STATICALLY_LINKED',
    SIDE_BY_SIDE = 'SIDE_BY_SIDE',
    STANDALONE = 'STANDALONE',
    INTERNAL_USE = 'INTERNAL_USE',
    OPTIONAL = 'OPTIONAL',
    TO_BE_REPLACED = 'TO_BE_REPLACED',
    CODE_SNIPPET = 'CODE_SNIPPET',
}

export default ReleaseRelationship
