// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

// AccessControl HOC - wraps pages to block specific roles (used in 19+ pages)
export { AccessControl } from './AccessControl'

// ViewerGate - hides UI elements from VIEWER role (used in Projects, Components tables)
export { RoleGate, ViewerGate } from './RoleGate'
