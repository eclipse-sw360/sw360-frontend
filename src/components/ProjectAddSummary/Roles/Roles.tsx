// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { GiCancel } from 'react-icons/gi'

import { SelectUsersDialog, SelectCountry } from 'next-sw360'
import DepartmentModal from './DepartmentModal'
import {ProjectPayload} from '@/object-types'

interface Props{
    projectPayload: ProjectPayload
    setProjectPayload: React.Dispatch<React.SetStateAction<ProjectPayload>>
    moderators: { [k: string]: string }
    setModerators: React.Dispatch<React.SetStateAction<{ [k: string]: string }>>
    contributors: { [k: string]: string }
    setContributors: React.Dispatch<React.SetStateAction<{ [k: string]: string }>>
    securityResponsibles: { [k: string]: string }
    setSecurityResponsibles: React.Dispatch<React.SetStateAction<{ [k: string]: string }>>
    projectOwner: { [k: string]: string }
    setProjectOwner: React.Dispatch<React.SetStateAction<{ [k: string]: string }>>
    projectManager: { [k: string]: string }
    setProjectManager: React.Dispatch<React.SetStateAction<{ [k: string]: string }>>
    leadArchitect: { [k: string]: string }
    setLeadArchitect: React.Dispatch<React.SetStateAction<{ [k: string]: string }>>
}

export default function Roles({
        projectPayload, 
        setProjectPayload, 
        moderators,
        setModerators,
        contributors, 
        setContributors,
        projectOwner,
        setProjectOwner,
        projectManager,
        setProjectManager,
        leadArchitect,
        setLeadArchitect,
        securityResponsibles,
        setSecurityResponsibles
    } : Props
) : JSX.Element {
    const t = useTranslations('default')

    const [showDepartmentModal, setShowDepartmentModal] = useState<boolean>(false)
    const [dialogOpenModerators, setDialogOpenModerators] = useState(false)
    const [dialogOpenProjectOwner, setDialogOpenProjectOwner] = useState(false)
    const [dialogOpenContributors, setDialogOpenContributors] = useState(false)
    const [dialogOpenSecurityResponsibles, setDialogOpenSecurityResponsibles] = useState(false)
    const [dialogOpenProjectManager, setDialogOpenProjectManager] = useState(false)
    const [dialogOpenLeadArchitect, setDialogOpenLeadArchitect] = useState(false)

    const updateField = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
        setProjectPayload({
            ...projectPayload,
            [e.target.name]: e.target.value,
        })
    }

    const setModeratorsToPayload = (users: { [k: string]: string }) => {
        setModerators(users)
        setProjectPayload({
            ...projectPayload,
            moderators: Object.keys(users),
        })
    }

    const handleClearModerators = () => {
        setModerators({})
        setProjectPayload({
            ...projectPayload,
            moderators: [],
        })
    }

    const setContributorsToPayload = (users: { [k: string]: string }) => {
        setContributors(users)
        setProjectPayload({
            ...projectPayload,
            contributors: Object.keys(users),
        })
    }

    const handleClearContributors = () => {
        setModerators({})
        setProjectPayload({
            ...projectPayload,
            contributors: [],
        })
    }

    const setSecurityResponsiblesToPayload = (users: { [k: string]: string }) => {
        setSecurityResponsibles(users)
        setProjectPayload({
            ...projectPayload,
            securityResponsibles: Object.keys(users),
        })
    }

    const handleClearSecurityResponsibles = () => {
        setModerators({})
        setProjectPayload({
            ...projectPayload,
            securityResponsibles: [],
        })
    }

    const setProjectOwnerToPayload = (user: { [k: string]: string }) => {
        const userEmails = Object.keys(user)
        if (userEmails.length === 0) {
            setProjectOwner({})
            setProjectPayload({
                ...projectPayload,
                projectOwner: '',
            })
        } else {
            setProjectOwner(user)
            setProjectPayload({
                ...projectPayload,
                projectOwner: userEmails[0],
            })
        }
    }

    const handleClearProjectOwner = () => {
        setProjectOwner({})
        setProjectPayload({
            ...projectPayload,
            projectOwner: '',
        })
    }

    const setProjectManagerToPayload = (user: { [k: string]: string }) => {
        const userEmails = Object.keys(user)
        if (userEmails.length === 0) {
            setProjectManager({})
            setProjectPayload({
                ...projectPayload,
                projectManager: '',
            })
        } else {
            setProjectManager(user)
            setProjectPayload({
                ...projectPayload,
                projectManager: userEmails[0],
            })
        }
    }

    const handleClearProjectManager = () => {
        setProjectManager({})
        setProjectPayload({
            ...projectPayload,
            projectManager: '',
        })
    }

    const setLeadArchitectToPayload = (user: { [k: string]: string }) => {
        const userEmails = Object.keys(user)
        if (userEmails.length === 0) {
            setLeadArchitect({})
            setProjectPayload({
                ...projectPayload,
                leadArchitect: '',
            })
        } else {
            setLeadArchitect(user)
            setProjectPayload({
                ...projectPayload,
                leadArchitect: userEmails[0],
            })
        }
    }

    const handleClearLeadArchitect = () => {
        setLeadArchitect({})
        setProjectPayload({
            ...projectPayload,
            leadArchitect: '',
        })
    }

    return (
        <>
            <DepartmentModal show={showDepartmentModal} setShow={setShowDepartmentModal} />
            <div className='row mb-4'>
                <h6 className='header pb-2 px-2'>{t('Roles')}</h6>
                <div className='row'>
                    <div className='col-lg-4 mb-3'>
                        <label htmlFor='addProjects.group' className='form-label fw-medium'>
                            {t('Group')} <span style={{ color: 'red' }}>*</span>
                        </label>
                        <input
                            type='text'
                            className='form-control'
                            id='addProjects.group'
                            aria-label={t('Group')}
                            placeholder={t('Click to edit')}
                            readOnly={true}
                            required
                            onClick={() => setShowDepartmentModal(true)}
                        />
                        <div className='form-text'>
                            {' '}
                            <GiCancel />
                        </div>
                    </div>
                    <div className='col-lg-4 mb-3'>
                        <label htmlFor='addProjects.projectManager' className='form-label fw-medium'>
                            {t('Project Manager')}
                        </label>
                        <input
                            type='text'
                            className='form-control'
                            placeholder={t('Click to edit')}
                            id='addProjects.projectManager'
                            aria-label={t('Project Manager')}
                            readOnly={true}
                            name='projectManager'
                            onClick={() => setDialogOpenProjectManager(true)}
                            value={(Object.values(projectManager).length === 0) ? '' : Object.values(projectManager)[0]}
                        />
                        <SelectUsersDialog
                            show={dialogOpenProjectManager}
                            setShow={setDialogOpenProjectManager}
                            setSelectedUsers={setProjectManagerToPayload}
                            selectedUsers={projectManager}
                            multiple={false}
                        />
                        <div className='form-text' onClick={handleClearProjectManager}>
                            {' '}
                            <GiCancel />
                        </div>
                    </div>
                    <div className='col-lg-4 mb-3'>
                        <label htmlFor='addProjects.projectOwner' className='form-label fw-medium'>
                            {t('Project Owner')}
                        </label>
                        <input
                            type='text'
                            className='form-control'
                            placeholder={t('Click to edit')}
                            id='addProjects.projectOwner'
                            aria-label={t('Project Owner')}
                            readOnly={true}
                            name='projectOwner'
                            onClick={() => setDialogOpenProjectOwner(true)}
                            value={(Object.values(projectOwner).length === 0) ? '' : Object.values(projectOwner)[0]}
                        />
                        <SelectUsersDialog
                            show={dialogOpenProjectOwner}
                            setShow={setDialogOpenProjectOwner}
                            setSelectedUsers={setProjectOwnerToPayload}
                            selectedUsers={projectOwner}
                            multiple={false}
                        />
                        <div className='form-text' onClick={handleClearProjectOwner}>
                            {' '}
                            <GiCancel />
                        </div>
                    </div>
                </div>
                <hr className='my-2' />
                <div className='row'>
                    <div className='col-lg-4 mb-3'>
                        <label htmlFor='addProjects.ownerAccountingUnit' className='form-label fw-medium'>
                            {t('Owner Accounting Unit')}
                        </label>
                        <input
                            type='text'
                            className='form-control'
                            aria-label={t('Owner Accounting Unit')}
                            id='addProjects.ownerAccountingUnit'
                            placeholder={t('owner_account_unit')}
                            name='ownerAccountingUnit'
                            onChange={updateField}
                            value={projectPayload.ownerAccountingUnit ?? ''}
                        />
                    </div>
                    <div className='col-lg-4 mb-3'>
                        <label htmlFor='addProjects.ownerBillingGroup' className='form-label fw-medium'>
                            {t('Owner Billing Group')}
                        </label>
                        <input
                            type='text'
                            className='form-control'
                            aria-label={t('Owner Billing Group')}
                            id='addProjects.ownerGroup'
                            placeholder={t('Enter Owner Billing Group')}
                            name='ownerGroup'
                            onChange={updateField}
                            value={projectPayload.ownerGroup ?? ''}
                        />
                    </div>
                    <div className='col-lg-4 mb-3'>
                        <SelectCountry selectCountry={updateField} value={projectPayload.ownerCountry ?? ''} />
                    </div>
                </div>
                <hr className='my-2' />
                <div className='row'>
                    <div className='col-lg-4 mb-3'>
                        <label htmlFor='addProjects.leadArchitect' className='form-label fw-medium'>
                            {t('Lead Architect')}
                        </label>
                        <input
                            type='text'
                            className='form-control'
                            placeholder={t('Click to edit')}
                            id='addProjects.leadArchitect'
                            aria-label={t('Lead Architect')}
                            readOnly={true}
                            name='leadArchitect'
                            onClick={() => setDialogOpenLeadArchitect(true)}
                            value={(Object.values(leadArchitect).length === 0) ? '' : Object.values(leadArchitect)[0]}
                        />
                        <SelectUsersDialog
                            show={dialogOpenLeadArchitect}
                            setShow={setDialogOpenLeadArchitect}
                            setSelectedUsers={setLeadArchitectToPayload}
                            selectedUsers={leadArchitect}
                            multiple={false}
                        />
                        <div className='form-text' onClick={handleClearLeadArchitect}>
                            {' '}
                            <GiCancel />
                        </div>
                    </div>
                    <div className='col-lg-4 mb-3'>
                        <label htmlFor='addProjects.moderators' className='form-label fw-medium'>
                            {t('Moderators')}
                        </label>
                        <input
                            type='text'
                            className='form-control'
                            id='addProjects.moderators'
                            aria-label={t('Moderators')}
                            placeholder={t('Click to edit')}
                            readOnly={true}
                            name='moderators'
                            value={Object.values(moderators).join(', ')}
                            onClick={() => setDialogOpenModerators(true)}
                        />
                        <SelectUsersDialog
                            show={dialogOpenModerators}
                            setShow={setDialogOpenModerators}
                            setSelectedUsers={setModeratorsToPayload}
                            selectedUsers={moderators}
                            multiple={true}
                        />
                        <div className='form-text' onClick={handleClearModerators}>
                            {' '}
                            <GiCancel />
                        </div>
                    </div>
                    <div className='col-lg-4 mb-3'>
                        <label htmlFor='addProjects.contributors' className='form-label fw-medium'>
                            {t('Contributors')}
                        </label>
                        <input
                            type='text'
                            className='form-control'
                            id='addProjects.contributors'
                            aria-label={t('Contributors')}
                            placeholder={t('Click to edit')}
                            readOnly={true}
                            name='contributors'
                            value={Object.values(contributors).join(', ')}
                            onClick={() => setDialogOpenContributors(true)}
                        />
                        <SelectUsersDialog
                            show={dialogOpenContributors}
                            setShow={setDialogOpenContributors}
                            setSelectedUsers={setContributorsToPayload}
                            selectedUsers={contributors}
                            multiple={true}
                        />
                        <div className='form-text' onClick={handleClearContributors}>
                            {' '}
                            <GiCancel />
                        </div>
                    </div>
                </div>
                <hr className='my-2' />
                <div className='row'>
                    <div className='col-lg-4 mb-3'>
                        <label htmlFor='addProjects.securityResponsibles' className='form-label fw-medium'>
                            {t('Security Responsibles')}
                        </label>
                        <input
                            type='text'
                            className='form-control'
                            id='addProjects.securityResponsibles'
                            aria-label={t('Security Responsibles')}
                            placeholder={t('Click to edit')}
                            readOnly={true}
                            name='securityResponsibles'
                            value={Object.values(securityResponsibles).join(', ')}
                            onClick={() => setDialogOpenSecurityResponsibles(true)}
                        />
                        <SelectUsersDialog
                            show={dialogOpenSecurityResponsibles}
                            setShow={setDialogOpenSecurityResponsibles}
                            setSelectedUsers={setSecurityResponsiblesToPayload}
                            selectedUsers={securityResponsibles}
                            multiple={true}
                        />
                        <div className='form-text' onClick={handleClearSecurityResponsibles}>
                            {' '}
                            <GiCancel />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
