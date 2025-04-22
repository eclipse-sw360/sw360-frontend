// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

// Server/Client side env
export const SW360_API_URL: string | undefined = process.env.NEXT_PUBLIC_SW360_API_URL;
export const AUTH_PROVIDER: string | undefined = process.env.NEXT_PUBLIC_SW360_AUTH_PROVIDER;

// Server side env
export const SW360_REST_CLIENT_ID: string | undefined = process.env.SW360_REST_CLIENT_ID;
export const SW360_REST_CLIENT_SECRET: string | undefined = process.env.SW360_REST_CLIENT_SECRET;
export const SW360_KEYCLOAK_CLIENT_ID = `${process.env.SW360_KEYCLOAK_CLIENT_ID}`;
export const SW360_KEYCLOAK_CLIENT_SECRET = `${process.env.SW360_KEYCLOAK_CLIENT_SECRET}`;
export const AUTH_ISSUER: string | undefined = process.env.AUTH_ISSUER;
