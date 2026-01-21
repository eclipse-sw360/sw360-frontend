// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

enum ConfigKeys {
    SPDX_DOCUMENT_ENABLED = 'spdx.document.enabled',
    ENABLE_FLEXIBLE_PROJECT_RELEASE_RELATIONSHIP = 'enable.flexible.project.release.relationship',
    IS_COMPONENT_VISIBILITY_RESTRICTION_ENABLED = 'component.visibility.restriction.enabled',
    USE_LICENSE_INFO_FROM_FILES = 'licenseinfo.spdxparser.use-license-info-from-files',
    MAINLINE_STATE_ENABLED_FOR_USER = 'mainline.state.enabled.for.user',
    IS_STORE_ATTACHMENT_TO_FILE_SYSTEM_ENABLED = 'enable.attachment.store.to.file.system',
    ATTACHMENT_DELETE_NO_OF_DAYS = 'attachment.delete.no.of.days',
    ATTACHMENT_STORE_FILE_SYSTEM_LOCATION = 'attachment.store.file.system.location',
    AUTO_SET_ECC_STATUS = 'auto.set.ecc.status',
    MAIL_REQUEST_FOR_PROJECT_REPORT = 'send.project.spreadsheet.export.to.mail.enabled',
    MAIL_REQUEST_FOR_COMPONENT_REPORT = 'send.component.spreadsheet.export.to.mail.enabled',
    IS_BULK_RELEASE_DELETING_ENABLED = 'bulk.release.deleting.enabled',
    DISABLE_CLEARING_FOSSOLOGY_REPORT_DOWNLOAD = 'disable.clearing.fossology.report.download',
    IS_FORCE_UPDATE_ENABLED = 'rest.force.update.enabled',
    SBOM_IMPORT_EXPORT_ACCESS_USER_ROLE = 'sbom.import.export.access.usergroup',
    TOOL_NAME = 'sw360.tool.name',
    TOOL_VENDOR = 'sw360.tool.vendor',
    PACKAGE_PORTLET_WRITE_ACCESS_USER_ROLE = 'package.portlet.write.access.usergroup',
    IS_ADMIN_PRIVATE_ACCESS_ENABLED = 'admin.private.project.access.enabled',
    IS_PACKAGE_PORTLET_ENABLED = 'package.portlet.enabled',
    RELEASE_SOURCECODE_URL_SKIP_DOMAINS = 'release.sourcecodeurl.skip.domains',
}

export default ConfigKeys
