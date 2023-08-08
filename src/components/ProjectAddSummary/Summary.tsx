// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

"use client"

import AddAdditionalRolesComponent from '@/components/AddAdditionalRoles'
import AddKeyValueComponent from '@/components/AddKeyValue'
import DocumentTypes from '@/object-types/enums/DocumentTypes'
import GeneralInformation from "./GeneralInformation"
import Roles from "./Roles/Roles"
import ProjectPayload from "@/object-types/CreateProjectPayload"
import { COMMON_NAMESPACE } from '@/object-types/Constants'
import { useTranslations } from "next-intl"

interface Props{
    token: string
    projectPayload: ProjectPayload
    setProjectPayload: React.Dispatch<React.SetStateAction<ProjectPayload>>
}

export default function Summary({token, projectPayload, setProjectPayload}: Props) {

    const t = useTranslations(COMMON_NAMESPACE)

    return (
        <>
            <div className="ms-1">
                <GeneralInformation
                    token={token}
                    projectPayload={projectPayload}
                    setProjectPayload={setProjectPayload}
                />
                <div className="row mb-4">
                    <AddKeyValueComponent
                        header={t('External URLs')}
                        keyName={t('external url')}
                    />
                </div>
                <Roles/>
                <div className="row mb-4">
                    <AddAdditionalRolesComponent
                        documentType={DocumentTypes.PROJECT}
                    />
                </div>
                <div className="row mb-4">
                    <AddKeyValueComponent
                        header={t('External Ids')}
                        keyName={t('external id')}
                    />
                </div>
                <div className="row mb-4">
                    <AddKeyValueComponent
                        header={t('Additional Data')}
                        keyName={t('Additional Data')}
                    />
                </div>
            </div>
        </>
    )
}
