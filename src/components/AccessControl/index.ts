// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

// AccessControl HOC - wraps pages to block specific roles
export { AccessControl } from './AccessControl'

// CapabilityGate - shows content based on role capabilities
export { CapabilityGate } from './CapabilityGate'

// Role-specific gates - hide/show UI elements based on user role
export {
    AdminGate,
    ClearingGate,
    EccAdminGate,
    RoleGate,
    SecurityAdminGate,
    ViewerGate,
} from './RoleGate'
