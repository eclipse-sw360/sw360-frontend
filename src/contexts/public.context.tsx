// Copyright (C) SW360 Frontend Authors (see <https://github.com/eclipse-sw360/sw360-frontend/blob/main/NOTICE>)

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
