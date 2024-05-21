// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

enum RequestedAction {
    READ = 1,
    WRITE = 2,
    DELETE = 3,
    USERS = 4,
    CLEARING = 5,
    ATTACHMENTS = 6,
    WRITE_ECC = 7,
}

export default RequestedAction
