// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import QuickFilter from './QuickFilter'
import { QuiickFilterProps } from './QuickFilter.types'

const quickfilter = {
    title: 'SW360/QuickFilter',
    component: QuickFilter,
}

const Template = (args: QuiickFilterProps) => (
    <div style={{ width: '10%' }}>
        <QuickFilter {...args} />
    </div>
)

export const Primary = Template.bind({})

export default quickfilter
