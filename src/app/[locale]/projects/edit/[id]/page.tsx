// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import EditProject from './components/EditProject'

import type { JSX } from "react";

interface Context {
    params: Promise<{ id: string }>
}

const ProjectEditPage = async (props: Context): Promise<JSX.Element> => {
    const params = await props.params;
    const projectId = params.id

    return <EditProject projectId={projectId} />
}

export default ProjectEditPage
