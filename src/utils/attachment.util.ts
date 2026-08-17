// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

/**
 * Maps attachment type enums to their short form representations
 * Based on backend's ThrriftEnumUtils.MAP_ATTACHMENT_TYPE_SHORT_STRING
 */
const ATTACHMENT_TYPE_SHORT_FORMS: Record<string, string> = {
    DOCUMENT: 'DOC',
    SOURCE: 'SRC',
    DESIGN: 'DES',
    REQUIREMENT: 'REQ',
    CLEARING_REPORT: 'CRT',
    COMPONENT_LICENSE_INFO_XML: 'CLX',
    COMPONENT_LICENSE_INFO_COMBINED: 'CLI',
    SCAN_RESULT_REPORT: 'SRR',
    SCAN_RESULT_REPORT_XML: 'SRX',
    SOURCE_SELF: 'SCS',
    BINARY: 'BIN',
    BINARY_SELF: 'BIS',
    DECISION_REPORT: 'DER',
    LEGAL_EVALUATION: 'LEG',
    LICENSE_AGREEMENT: 'LAG',
    SCREENSHOT: 'SCR',
    OTHER: 'OTH',
    README_OSS: 'ROS',
    SECURITY_ASSESSMENT: 'SEA',
    INITIAL_SCAN_REPORT: 'ISR',
    SBOM: 'SBM',
    INTERNAL_USE_SCAN: 'IUS',
}

/**
 * Get the short form of an attachment type
 * @param attachmentType - The full attachment type enum value (e.g., 'CLEARING_REPORT')
 * @returns The short form (e.g., 'CRT'), or empty string if not found
 */
export const getAttachmentTypeShortForm = (attachmentType?: string): string => {
    if (!attachmentType) return ''
    return ATTACHMENT_TYPE_SHORT_FORMS[attachmentType] ?? attachmentType
}

export default getAttachmentTypeShortForm
