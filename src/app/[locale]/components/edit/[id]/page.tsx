// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getServerSession } from "next-auth/next"
import { Session } from '@/object-types/Session'
import EditComponent from './components/EditComponent'

interface Context {
  params: { id: string }
}

const ComponentEditPage = async ({ params }: Context) => {
  const session: Session = await getServerSession(authOptions);
  const componentId = params.id;

  return <EditComponent session={session} componentId={componentId} />
}

export default ComponentEditPage
