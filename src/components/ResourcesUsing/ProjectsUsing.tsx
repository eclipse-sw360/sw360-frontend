// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { useEffect, useState } from 'react'
import Link from 'next-intl/link'
import { _, Table } from '@/components/sw360'
import { useTranslations } from 'next-intl'
import { COMMON_NAMESPACE } from '@/object-types/Constants'
import { Alert } from 'react-bootstrap'
import EmbeddedProject from '@/object-types/EmbeddedProject'
import { RestrictedResource } from '@/object-types/Resources'

interface Props {
    projectUsings: Array<EmbeddedProject>
    documentName: string
    restrictedResource: RestrictedResource
}

const ProjectsUsing = ({ projectUsings, documentName, restrictedResource }: Props) => {
    const t = useTranslations(COMMON_NAMESPACE)
    const [tableData, setTableData] = useState([])

    const columns = [
        {
            id: 'name',
            name: t('Name'),
        },
        {
            id: 'businessUnit',
            name: t('Group'),
        },
        {
            id: 'projectResponsible',
            name: t('Responsible'),
        },
    ]

    useEffect(() => {
        const data = projectUsings.map((project: EmbeddedProject) => [
            _(
                <Link
                    key={project._links.self.href.split('/').at(-1)}
                    href={`/projects/detail/${project._links.self.href.split('/').at(-1)}`}
                >
                    {project.version ? `${project.name} (${project.version})` : project.name}
                </Link>
            ),
            project.businessUnit,
            _(<Link href={`mailTo:${project.projectResponsible}}`}>{project.projectResponsible}</Link>),
        ])
        setTableData(data)
    }, [projectUsings])

    return (
        <>
            <Alert variant='primary'>
                {`${documentName} is used by a total of ${restrictedResource.projects + projectUsings.length} (${
                    projectUsings.length
                } visible / ${restrictedResource.projects} restricted) projects.`}
            </Alert>
            <Table data={tableData} columns={columns} />
        </>
    )
}

export default ProjectsUsing
