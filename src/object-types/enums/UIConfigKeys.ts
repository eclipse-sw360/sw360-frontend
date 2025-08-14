// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

export enum UIConfigKeys {
    UI_COMPONENT_EXTERNALKEYS = 'ui.component.externalkeys',
    UI_DOMAINS = 'ui.domains',
    UI_RELEASE_EXTERNALKEYS = 'ui.release.externalkeys',
    UI_COMPONENT_CATEGORIES = 'ui.component.categories',
    UI_OPERATING_SYSTEMS = 'ui.operating.systems',
    UI_PROJECT_TYPE = 'ui.project.type',
    UI_STATE = 'ui.state',
    UI_PROJECT_EXTERNALURLS = 'ui.project.externalurls',
    UI_CUSTOM_WELCOME_PAGE_GUIDELINE = 'ui.custom.welcome.page.guideline',
    UI_PROJECT_TAG = 'ui.project.tag',
    UI_ENABLE_ADD_LICENSE_INFO_TO_RELEASE_BUTTON = 'ui.enable.add.license.info.to.release.button',
    UI_PROGRAMMING_LANGUAGES = 'ui.programming.languages',
    UI_CUSTOMMAP_RELEASE_ROLES = 'ui.custommap.release.roles',
    UI_SOFTWARE_PLATFORMS = 'ui.software.platforms',
    UI_PROJECT_EXTERNALKEYS = 'ui.project.externalkeys',
    UI_CLEARING_TEAMS = 'ui.clearing.teams',
    UI_CLEARING_TEAM_UNKNOWN_ENABLED = 'ui.clearing.team.unknown.enabled',
    UI_ORG_ECLIPSE_SW360_DISABLE_CLEARING_REQUEST_FOR_PROJECT_GROUP = 'ui.org.eclipse.sw360.disable.clearing.request.for.project.group',
    UI_CUSTOMMAP_COMPONENT_ROLES = 'ui.custommap.component.roles',
    UI_CUSTOMMAP_PROJECT_ROLES = 'ui.custommap.project.roles',
    UI_ENABLE_SECURITY_VULNERABILITY_MONITORING = 'ui.enable.security.vulnerability.monitoring',
    UI_REST_APITOKEN_GENERATOR_ENABLE = 'ui.rest.apitoken.generator.enable',
}

export const ArrayTypeUIConfigKeys: UIConfigKeys[] = [
    UIConfigKeys.UI_DOMAINS,
    UIConfigKeys.UI_PROJECT_TYPE,
    UIConfigKeys.UI_STATE,
    UIConfigKeys.UI_PROJECT_TAG,
    UIConfigKeys.UI_PROJECT_EXTERNALURLS,
    UIConfigKeys.UI_PROJECT_EXTERNALKEYS,
    UIConfigKeys.UI_CUSTOMMAP_PROJECT_ROLES,
    UIConfigKeys.UI_CLEARING_TEAMS,
    UIConfigKeys.UI_ORG_ECLIPSE_SW360_DISABLE_CLEARING_REQUEST_FOR_PROJECT_GROUP,
    UIConfigKeys.UI_COMPONENT_CATEGORIES,
    UIConfigKeys.UI_CUSTOMMAP_COMPONENT_ROLES,
    UIConfigKeys.UI_COMPONENT_EXTERNALKEYS,
    UIConfigKeys.UI_RELEASE_EXTERNALKEYS,
    UIConfigKeys.UI_OPERATING_SYSTEMS,
    UIConfigKeys.UI_PROGRAMMING_LANGUAGES,
    UIConfigKeys.UI_SOFTWARE_PLATFORMS,
    UIConfigKeys.UI_CUSTOMMAP_RELEASE_ROLES,
]
