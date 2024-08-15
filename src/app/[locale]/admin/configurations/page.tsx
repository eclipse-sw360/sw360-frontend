// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import FeatureConfigurations from './components/FeatureConfigurations'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Configurations',
}

const ConfigurationsPage = () => {
    return <FeatureConfigurations />
}

export default ConfigurationsPage