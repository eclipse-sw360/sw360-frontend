// Copyright (C) Helio Chissini de Castro, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import UserGroupType from "./enums/UserGroupType"

type NavItem = {
    href: string
    name: string
    id: string
    visibility?: UserGroupType[]
    childs?: Array<NavItem>
}

export default NavItem
