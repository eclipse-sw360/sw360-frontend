// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import EditProject from './components/EditProject'

interface Context {
    params: { id: string }
}

const ProjectEditPage = ({ params }: Context): JSX.Element => {
    const projectId = params.id

    return <EditProject projectId={projectId} />
}

export default ProjectEditPage
