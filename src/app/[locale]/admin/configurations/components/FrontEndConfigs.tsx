// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { PageButtonHeader, PageSpinner, PillsInput } from 'next-sw360'
import { type JSX, useCallback, useEffect, useState } from 'react'
import OnOffSwitch from '@/app/[locale]/admin/configurations/components/OnOffSwitch'
import {
    ConfigurationContainers,
    HttpStatus,
    ProcessedUiConfig,
    parseRawUiConfig,
    UIConfigKeys,
    UiConfiguration,
} from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'

const FrontEndConfigs = (): JSX.Element => {
    const t = useTranslations('default')
    const [currentUiConfig, setCurrentUiConfig] = useState<UiConfiguration | undefined>(undefined)
    const [arrayKeyStates, setArrayKeyStates] = useState<ProcessedUiConfig>({} as ProcessedUiConfig)
    const { status } = useSession()
    const apiEndpoint = `configurations/container/${ConfigurationContainers.UI_CONFIGURATION}`

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [
        status,
    ])

    const fetchUiConfig = useCallback(async () => {
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) {
            MessageService.error(t('Session has expired'))
            signOut()
            return
        }
        const response = await ApiUtils.GET(apiEndpoint, session.user.access_token)
        if (response.status == HttpStatus.OK) {
            const data = (await response.json()) as UiConfiguration
            setCurrentUiConfig(data)
        } else if (response.status == HttpStatus.UNAUTHORIZED) {
            await signOut()
        } else {
            setCurrentUiConfig({} as UiConfiguration)
        }
    }, [])

    useEffect(() => {
        fetchUiConfig()
    }, [])

    useEffect(() => {
        updateInternalState()
    }, [
        currentUiConfig,
    ])

    const updateConfig = async (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault()
        if (currentUiConfig === undefined) return
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) {
            MessageService.error(t('Session has expired'))
            signOut()
            return
        }
        const response = await ApiUtils.PATCH(apiEndpoint, currentUiConfig, session.user.access_token)
        if (response.status == HttpStatus.OK) {
            MessageService.success(t('Updated frontend configurations successfully'))
        } else if (response.status == HttpStatus.UNAUTHORIZED) {
            await signOut()
        } else {
            const message = await response.json()
            MessageService.error(message)
        }
    }

    const headerButtons = {
        'Update Frontend Configuration': {
            link: '#',
            onClick: updateConfig,
            type: 'primary',
            name: t('Update Frontend Configurations'),
        },
    }

    const updateInternalState = () => {
        setArrayKeyStates(parseRawUiConfig(currentUiConfig ?? ({} as UiConfiguration)))
    }

    const onArrayStateChangeHandler = (key: UIConfigKeys) => (newValues: string[]) => {
        // Update the global state, internal state will be updated by useEffect
        setCurrentUiConfig(
            (prev) =>
                ({
                    ...prev,
                    [key]: JSON.stringify(newValues),
                }) as UiConfiguration,
        )
    }

    return (
        <>
            <div className='container page-content'>
                <PageButtonHeader
                    title={`${t('Frontend Configurations')}`}
                    buttons={headerButtons}
                />
                {currentUiConfig ? (
                    <>
                        <h6 className='fw-bold text-uppercase text-blue'>
                            {t('UI Element Configurations')}
                            <hr className='my-2 mb-2' />
                        </h6>
                        <table className='table label-value-table'>
                            <thead>
                                <tr>
                                    <th className='w-25'>{t('Name')}</th>
                                    <th className='w-50'>{t('Value')}</th>
                                    <th className='w-25'>{t('Description')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr id='ui-domains'>
                                    <td className='align-middle fw-bold'>{t('Domains')}</td>
                                    <td>
                                        <PillsInput
                                            tags={arrayKeyStates[UIConfigKeys.UI_DOMAINS]}
                                            onTagsChange={onArrayStateChangeHandler(UIConfigKeys.UI_DOMAINS)}
                                        />
                                    </td>
                                    <td>{t('ui_domains')}</td>
                                </tr>
                                <tr id='ui-project-type'>
                                    <td className='align-middle fw-bold'>{t('Project Types')}</td>
                                    <td>
                                        <PillsInput
                                            tags={arrayKeyStates[UIConfigKeys.UI_PROJECT_TYPE]}
                                            onTagsChange={onArrayStateChangeHandler(UIConfigKeys.UI_PROJECT_TYPE)}
                                        />
                                    </td>
                                    <td>{t('ui_project_type')}</td>
                                </tr>
                                <tr id='ui-state'>
                                    <td className='align-middle fw-bold'>{t('Project States')}</td>
                                    <td>
                                        <PillsInput
                                            tags={arrayKeyStates[UIConfigKeys.UI_STATE]}
                                            onTagsChange={onArrayStateChangeHandler(UIConfigKeys.UI_STATE)}
                                        />
                                    </td>
                                    <td>{t('ui_state')}</td>
                                </tr>
                                <tr id='ui-project-tag'>
                                    <td className='align-middle fw-bold'>{t('Project Tags')}</td>
                                    <td>
                                        <PillsInput
                                            tags={arrayKeyStates[UIConfigKeys.UI_PROJECT_TAG]}
                                            onTagsChange={onArrayStateChangeHandler(UIConfigKeys.UI_PROJECT_TAG)}
                                        />
                                    </td>
                                    <td>{t('ui_project_tags')}</td>
                                </tr>
                                <tr id='ui-project-externalurls'>
                                    <td className='align-middle fw-bold'>{t('Project External URLs')}</td>
                                    <td>
                                        <PillsInput
                                            tags={arrayKeyStates[UIConfigKeys.UI_PROJECT_EXTERNALURLS]}
                                            onTagsChange={onArrayStateChangeHandler(
                                                UIConfigKeys.UI_PROJECT_EXTERNALURLS,
                                            )}
                                        />
                                    </td>
                                    <td>{t('ui_project_externalurls')}</td>
                                </tr>
                                <tr id='ui-project-externalkeys'>
                                    <td className='align-middle fw-bold'>{t('Project External Keys')}</td>
                                    <td>
                                        <PillsInput
                                            tags={arrayKeyStates[UIConfigKeys.UI_PROJECT_EXTERNALKEYS]}
                                            onTagsChange={onArrayStateChangeHandler(
                                                UIConfigKeys.UI_PROJECT_EXTERNALKEYS,
                                            )}
                                        />
                                    </td>
                                    <td>{t('ui_project_externalkeys')}</td>
                                </tr>
                                <tr id='ui-custommap-project-roles'>
                                    <td className='align-middle fw-bold'>{t('Project Roles')}</td>
                                    <td>
                                        <PillsInput
                                            tags={arrayKeyStates[UIConfigKeys.UI_CUSTOMMAP_PROJECT_ROLES]}
                                            onTagsChange={onArrayStateChangeHandler(
                                                UIConfigKeys.UI_CUSTOMMAP_RELEASE_ROLES,
                                            )}
                                        />
                                    </td>
                                    <td>{t('ui_custommap_project_roles')}</td>
                                </tr>
                                <tr id='ui-clearing-teams'>
                                    <td className='align-middle fw-bold'>{t('Clearing Teams')}</td>
                                    <td>
                                        <PillsInput
                                            tags={arrayKeyStates[UIConfigKeys.UI_CLEARING_TEAMS]}
                                            onTagsChange={onArrayStateChangeHandler(UIConfigKeys.UI_CLEARING_TEAMS)}
                                        />
                                    </td>
                                    <td>{t('ui_clearing_teams')}</td>
                                </tr>
                                <tr id='ui-clearing-team-unknown-enabled'>
                                    <td className='align-middle fw-bold'>{t('Allow Unknown in Clearing Team')}</td>
                                    <td>
                                        <OnOffSwitch
                                            size={25}
                                            setCurrentUiConfig={setCurrentUiConfig}
                                            checked={
                                                currentUiConfig[UIConfigKeys.UI_CLEARING_TEAM_UNKNOWN_ENABLED] ===
                                                'true'
                                            }
                                            propKey={UIConfigKeys.UI_CLEARING_TEAM_UNKNOWN_ENABLED}
                                        />
                                    </td>
                                    <td>{t('ui_clearing_team_unknown_enabled')}</td>
                                </tr>
                                <tr id='ui-org-eclipse-sw360-disable-clearing-request-for-project-group'>
                                    <td className='align-middle fw-bold'>
                                        {t('Disable Clearing Request for Project Groups')}
                                    </td>
                                    <td>
                                        <PillsInput
                                            tags={
                                                arrayKeyStates[
                                                    UIConfigKeys
                                                        .UI_ORG_ECLIPSE_SW360_DISABLE_CLEARING_REQUEST_FOR_PROJECT_GROUP
                                                ]
                                            }
                                            onTagsChange={onArrayStateChangeHandler(
                                                UIConfigKeys.UI_ORG_ECLIPSE_SW360_DISABLE_CLEARING_REQUEST_FOR_PROJECT_GROUP,
                                            )}
                                        />
                                    </td>
                                    <td>{t('ui_org_eclipse_sw360_disable_clearing_request_for_project_group')}</td>
                                </tr>
                                <tr id='ui-component-categories'>
                                    <td className='align-middle fw-bold'>{t('Component Categories')}</td>
                                    <td>
                                        <PillsInput
                                            tags={arrayKeyStates[UIConfigKeys.UI_COMPONENT_CATEGORIES]}
                                            onTagsChange={onArrayStateChangeHandler(
                                                UIConfigKeys.UI_COMPONENT_CATEGORIES,
                                            )}
                                        />
                                    </td>
                                    <td>{t('ui_component_categories')}</td>
                                </tr>
                                <tr id='ui-custommap-component-roles'>
                                    <td className='align-middle fw-bold'>{t('Component Roles')}</td>
                                    <td>
                                        <PillsInput
                                            tags={arrayKeyStates[UIConfigKeys.UI_CUSTOMMAP_COMPONENT_ROLES]}
                                            onTagsChange={onArrayStateChangeHandler(
                                                UIConfigKeys.UI_CUSTOMMAP_COMPONENT_ROLES,
                                            )}
                                        />
                                    </td>
                                    <td>{t('ui_custommap_component_roles')}</td>
                                </tr>
                                <tr id='ui-component-externalkeys'>
                                    <td className='align-middle fw-bold'>{t('External Keys for Components')}</td>
                                    <td>
                                        <PillsInput
                                            tags={arrayKeyStates[UIConfigKeys.UI_COMPONENT_EXTERNALKEYS]}
                                            onTagsChange={onArrayStateChangeHandler(
                                                UIConfigKeys.UI_COMPONENT_EXTERNALKEYS,
                                            )}
                                        />
                                    </td>
                                    <td>{t('ui_component_externalkeys')}</td>
                                </tr>
                                <tr id='ui-release-externalkeys'>
                                    <td className='align-middle fw-bold'>{t('External Keys for Releases')}</td>
                                    <td>
                                        <PillsInput
                                            tags={arrayKeyStates[UIConfigKeys.UI_RELEASE_EXTERNALKEYS]}
                                            onTagsChange={onArrayStateChangeHandler(
                                                UIConfigKeys.UI_RELEASE_EXTERNALKEYS,
                                            )}
                                        />
                                    </td>
                                    <td>{t('ui_release_externalkeys')}</td>
                                </tr>
                                <tr id='ui-operating-systems'>
                                    <td className='align-middle fw-bold'>{t('Operating Systems')}</td>
                                    <td>
                                        <PillsInput
                                            tags={arrayKeyStates[UIConfigKeys.UI_OPERATING_SYSTEMS]}
                                            onTagsChange={onArrayStateChangeHandler(UIConfigKeys.UI_OPERATING_SYSTEMS)}
                                        />
                                    </td>
                                    <td>{t('ui_operating_systems')}</td>
                                </tr>
                                <tr id='ui-programming-languages'>
                                    <td className='align-middle fw-bold'>{t('Programming Languages')}</td>
                                    <td>
                                        <PillsInput
                                            tags={arrayKeyStates[UIConfigKeys.UI_PROGRAMMING_LANGUAGES]}
                                            onTagsChange={onArrayStateChangeHandler(
                                                UIConfigKeys.UI_PROGRAMMING_LANGUAGES,
                                            )}
                                        />
                                    </td>
                                    <td>{t('ui_programming_languages')}</td>
                                </tr>
                                <tr id='ui-software-platforms'>
                                    <td className='align-middle fw-bold'>{t('Software Platforms')}</td>
                                    <td>
                                        <PillsInput
                                            tags={arrayKeyStates[UIConfigKeys.UI_SOFTWARE_PLATFORMS]}
                                            onTagsChange={onArrayStateChangeHandler(UIConfigKeys.UI_SOFTWARE_PLATFORMS)}
                                        />
                                    </td>
                                    <td>{t('ui_software_platforms')}</td>
                                </tr>
                                <tr id='ui-enable-add-license-info-to-release-button'>
                                    <td className='align-middle fw-bold'>{t('Enable Add License Info')}</td>
                                    <td>
                                        <OnOffSwitch
                                            size={25}
                                            setCurrentUiConfig={setCurrentUiConfig}
                                            checked={
                                                currentUiConfig[
                                                    UIConfigKeys.UI_ENABLE_ADD_LICENSE_INFO_TO_RELEASE_BUTTON
                                                ] === 'true'
                                            }
                                            propKey={UIConfigKeys.UI_ENABLE_ADD_LICENSE_INFO_TO_RELEASE_BUTTON}
                                        />
                                    </td>
                                    <td>{t('ui_enable_add_license_info_to_release_button')}</td>
                                </tr>
                                <tr id='ui-custommap-release-roles'>
                                    <td className='align-middle fw-bold'>{t('Release Roles')}</td>
                                    <td>
                                        <PillsInput
                                            tags={arrayKeyStates[UIConfigKeys.UI_CUSTOMMAP_RELEASE_ROLES]}
                                            onTagsChange={onArrayStateChangeHandler(
                                                UIConfigKeys.UI_CUSTOMMAP_RELEASE_ROLES,
                                            )}
                                        />
                                    </td>
                                    <td>{t('ui_custommap_release_roles')}</td>
                                </tr>
                                <tr id='ui-custom-welcome-page-guideline'>
                                    <td className='align-middle fw-bold'>{t('Custom Welcome Page Guideline')}</td>
                                    <td>
                                        <OnOffSwitch
                                            size={25}
                                            setCurrentUiConfig={setCurrentUiConfig}
                                            checked={
                                                currentUiConfig[UIConfigKeys.UI_CUSTOM_WELCOME_PAGE_GUIDELINE] ===
                                                'true'
                                            }
                                            propKey={UIConfigKeys.UI_CUSTOM_WELCOME_PAGE_GUIDELINE}
                                        />
                                    </td>
                                    <td>{t('ui_custom_welcome_page_guideline')}</td>
                                </tr>
                                <tr id='ui-enable-security-vulnerability-monitoring'>
                                    <td className='align-middle fw-bold'>
                                        {t('Enable Security Vulnerability Monitoring')}
                                    </td>
                                    <td>
                                        <OnOffSwitch
                                            size={25}
                                            setCurrentUiConfig={setCurrentUiConfig}
                                            checked={
                                                currentUiConfig[
                                                    UIConfigKeys.UI_ENABLE_SECURITY_VULNERABILITY_MONITORING
                                                ] === 'true'
                                            }
                                            propKey={UIConfigKeys.UI_ENABLE_SECURITY_VULNERABILITY_MONITORING}
                                        />
                                    </td>
                                    <td>{t('ui_enable_security_vulnerability_monitoring')}</td>
                                </tr>
                                <tr id='ui-rest-apitoken-generator-enable'>
                                    <td className='align-middle fw-bold'>{t('Enable REST API Token generator')}</td>
                                    <td>
                                        <OnOffSwitch
                                            size={25}
                                            setCurrentUiConfig={setCurrentUiConfig}
                                            checked={
                                                currentUiConfig[
                                                    UIConfigKeys.UI_REST_APITOKEN_WRITE_GENERATOR_ENABLE
                                                ] === 'true'
                                            }
                                            propKey={UIConfigKeys.UI_REST_APITOKEN_WRITE_GENERATOR_ENABLE}
                                        />
                                    </td>
                                    <td>{t('ui_rest_apitoken_generator_enable')}</td>
                                </tr>
                            </tbody>
                        </table>
                    </>
                ) : (
                    <PageSpinner />
                )}
            </div>
        </>
    )
}

export default FrontEndConfigs
