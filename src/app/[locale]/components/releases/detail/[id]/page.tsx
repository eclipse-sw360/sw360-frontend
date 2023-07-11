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
import DetailOverview from './components/DetailOverview'

interface Context {
  params: { id: string }
}

const Detail = async ({ params }: Context) => {
<<<<<<<< HEAD:src/app/[locale]/components/detail/[id]/page.tsx
  const session: Session = await getServerSession(authOptions);
  const componentId = params.id;

  return <DetailOverview session={session} componentId={componentId} />
}

export default Detail
========
  const session: Session = await getServerSession(authOptions)
  const releaseId = params.id

  return <DetailOverview session={session} releaseId={releaseId} />
}

export default Detail
>>>>>>>> 638bcdebaab52f71c5ab09003551b5fc0d6f413a:src/app/[locale]/components/releases/detail/[id]/page.tsx
