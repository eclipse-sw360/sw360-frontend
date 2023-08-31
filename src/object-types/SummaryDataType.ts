// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

export interface SummaryDataType {
    description: string;

    // General Information
    id: string;
    name: string;
    version: string;
    visibility: string;
    createdOn: string;
    createdBy: {
        name: string;
        email: string;
    };
    modifiedOn: string;
    modifiedBy: {
        name: string;
        email: string;
    };
    projectType: string;
    domain: string;
    tag: string;
    externalIds: Map<string, string>;
    additionalData: Map<string, string>;
    externalUrls: Map<string, string>;

    // Roles
    group: string;
    projectResponsible: {
        name: string;
        email: string;
    };
    projectOwner: {
        name: string;
        email: string;
    };
    ownerAccountingUnit: string;
    ownerBillingGroup: string;
    ownerCountry: string;
    leadArchitect: {
        name: string;
        email: string;
    };
    moderators: {
        name: string;
        email: string;
    }[];
    contributors: {
        name: string;
        email: string;
    }[];
    securityResponsibles: {
        name: string;
        email: string;
    }[];
    additionalRoles: Map<string, string>;

    // Project Vendor
    vendorFullName: string;
    vendorShortName: string;
    vendorUrl: string;
}