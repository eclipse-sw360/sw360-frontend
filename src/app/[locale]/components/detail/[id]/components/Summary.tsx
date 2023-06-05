// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import ComponentGeneral from "./ComponentGeneral"
import ReleaseAgrregateData from './ReleaseAggregate'
import SummaryRole from "./SummaryRole"

const Summary = ({ component, componentId }: any) => {
  return (
    <div className='col'>
      <div>
        <p id='up_Summary'>{component.description}</p>
      </div>
      <div>
        <ComponentGeneral component={component} componentId={componentId} />
      </div>
      <div>
        <ReleaseAgrregateData component={component} componentId={componentId} />
      </div>
      <div>
        <SummaryRole component={component} componentId={componentId} />
      </div>
    </div>
  )
}

export default Summary
