// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

export interface Obligation {
    id?: string
    type?: string
    text?: string
    whitelist?: Array<string>
    development?: string
    distribution?: string
    title?: string
    obligationLevel?: string
    obligationType?: string
    node?: string
    issetBitfield?: number
    customPropertyToValue?: Map<string, string>
    _links?: {
        self: {
            href: string
        }
    }
}

export interface LicenseObligationRelease {
    name: string
    version: string
    type: string
    id: string
}

export interface LicenseObligationData {
    [k: string]: {
        text?: string
        licenseIds?: string[]
        id?: string
        obligationLevel?: string
        status?: string
        comment?: string
        obligationType?: string
        releases?: LicenseObligationRelease[]
    }
}

export interface LicenseObligationsList {
    obligations: LicenseObligationData
    page?: {
        size?: number
        totalElements?: number
        totalPages?: number
        number?: number
    }
}

export interface ComponentObligationData {
    [k: string]: {
        text?: string
        id?: string
        status?: string
        comment?: string
        obligationType?: string
        obligationLevel?: string
        modifiedBy?: string
        modifiedOn?: string
        releaseIdToAcceptedCLI?: {}
    }
}

export interface ProjectObligationData {
    [k: string]: {
        text?: string
        id?: string
        status?: string
        comment?: string
        obligationType?: string
    }
}

export interface OrganizationObligationData {
    [k: string]: {
        text?: string
        id?: string
        status?: string
        comment?: string
        obligationType?: string
    }
}

export interface TreeNode {
    id: string
    type: string
    text: string
    children: TreeNode[]
    parentId?: string
    languageElement?: string
    action?: string
    object?: string
}

export interface ObligationElement {
    languageElement: string
    action: string
    object: string
    selected: boolean
}

export interface ObligationTreeProps {
    tree: TreeNode[]
    title: string
    onAddChild: (parentId?: string) => void
    onAddSibling: (nodeId: string, parentId?: string) => void
    onDeleteNode: (nodeId: string, parentId?: string) => void
    onUpdateNode: (
        nodeId: string,
        field: 'type' | 'text' | 'languageElement' | 'action' | 'object',
        value: string,
    ) => void
    onUpdateNodeElement: (nodeId: string, element: ObligationElement) => void
}

export interface ObligationFormProps {
    obligation: Obligation
    setObligation: React.Dispatch<React.SetStateAction<Obligation>>
}

export const ObligationTypes = {
    PERMISSION: 'Permission',
    RISK: 'Risk',
    EXCEPTION: 'Exception',
    RESTRICTION: 'Restriction',
    OBLIGATION: 'Obligation',
}

export const ObligationLevels = {
    COMPONENT_OBLIGATION: 'Component Obligation',
    ORGANISATION_OBLIGATION: 'Organisation Obligation',
    PROJECT_OBLIGATION: 'Project Obligation',
    LICENSE_OBLIGATION: 'License Obligation',
}

export const ObligationLevelInfo = {
    'Organisation Obligation':
        'Organisation Obligations are general rules or mandatory steps to made sure before conveying software. An example would be to add the OSS contact e-mail address in case of questions to the project, software or to the organisation at all instances of conveyed software.',
    'Component Obligation':
        'Component obligations are obligations for a specific component or release only. For example, special measure or actions to be carried out could result from trade compliance or IP issues with the component.',
    'License Obligation':
        'License obligation are task to be carried out or risks to be considered from the use of software under a particular license.',
    'Project Obligation':
        'Project obligations are specific to the projects or products nature and are also requires steps or tasks to be made sure before conveying the software. An example could be tiny hardware with limited printed documentation. In this case open source license information would required special handling, for example print instructions how to obtain OSS license information on the packaging.',
}
