/*
 * Copyright (C) TOSHIBA CORPORATION, 2023.
 * Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023.
 * SPDX-License-Identifier: EPL-2.0
 * License-Filename: LICENSE
 */

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
