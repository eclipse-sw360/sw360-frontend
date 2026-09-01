// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

enum UserGroupPriority {
    SW360_ADMIN = 1,
    ADMIN = 1,
    CLEARING_ADMIN = 2,
    CLEARING_EXPERT = 2,
    ECC_ADMIN = 2,
    SECURITY_ADMIN = 2,
    SECURITY_USER = 2,
    USER = 3,
    VIEWER = 4,
}

export default UserGroupPriority
