// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import React, { createContext, useState } from 'react';

export const PublicContext = createContext<any> ('');

const PublicContextProvider = ({ children }: any) => {
    const publicContextData = {
    }

    return (
        <PublicContext.Provider value={publicContextData}>{children}</PublicContext.Provider>
    );
}

export default PublicContextProvider;
