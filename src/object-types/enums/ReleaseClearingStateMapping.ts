// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

enum ReleaseClearingStateMapping {
    NEW_CLEARING = 'NEW_CLEARING',
    APPROVED = 'REPORT_APPROVED',
    REPORT_AVAILABLE = 'REPORT_AVAILABLE',
    SCAN_AVAILABLE = 'SCAN_AVAILABLE',
    SENT_TO_CLEARING_TOOL = 'SENT_TO_CLEARING_TOOL',
    UNDER_CLEARING = 'UNDER_CLEARING',
    INTERNAL_USE_SCAN_AVAILABLE = 'INTERNAL_USE_SCAN_AVAILABLE',
}

export default ReleaseClearingStateMapping