// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

declare module "gridjs" {
  export type TCell = string | number | boolean | null | HTMLElement | Record<string, any>;

  export type OneDArray = TCell[];

  export type Data = OneDArray[] | { [key: string]: TCell }[] | (() => Promise<OneDArray[] | { [key: string]: TCell }[]>);

  export interface Row<T = TCell> {
    cells: { data: T }[];
    [key: string]: any;
  }

  export interface TColumn<T = TCell> {
    id?: string;
    data?: string | ((row: Row<T>) => T);
    name?: string;
    width?: string | number;
    sort?: boolean;
    hidden?: boolean;
    formatter?: (cell: T, row?: Row<T>, column?: TColumn<T>) => any;
    attributes?: { [key: string]: any } | ((cell: T, row?: Row<T>, column?: TColumn<T>) => { [key: string]: any });
    [key: string]: any;
  }

  export interface SearchConfig {
    keyword?: string;
    server?: {
      url: string | ((prev: any, keyword: string) => string | Promise<string>);
      then?: (res: any) => OneDArray[] | { [key: string]: TCell }[] | Promise<OneDArray[] | { [key: string]: TCell }[]>;
      total?: (res: any) => number;
    };
    debounceTimeout?: number;
    selector?: (cell: TCell, rowIndex: number, cellIndex: number) => boolean | TCell;
    ignoreHiddenColumns?: boolean;
    [key: string]: any;
  }

  export interface Config<T = TCell> {
    data?: Data;
    columns?: (string | TColumn<T>)[];
    server?: {
      url: string | (() => string | Promise<string>);
      then?: (res: any) => OneDArray[] | { [key: string]: TCell }[] | Promise<OneDArray[] | { [key: string]: TCell }[]>;
      total?: (res: any) => number;
    };
    search?: boolean | SearchConfig;
    sort?: boolean | { enabled?: boolean; multiColumn?: boolean; server?: { url: string | ((prev: any, column: TColumn<T>, direction: "asc" | "desc") => string | Promise<string>); then?: (res: any) => OneDArray[] | { [key: string]: TCell }[] | Promise<OneDArray[] | { [key: string]: TCell }[]>; } };
    pagination?: boolean | { enabled?: boolean; limit?: number; summary?: boolean; server?: { url: string | ((prev: any, page: number, limit: number) => string | Promise<string>); then?: (res: any) => OneDArray[] | { [key: string]: TCell }[] | Promise<OneDArray[] | { [key: string]: TCell }[]>; } };
    width?: string | number;
    height?: string | number;
    autoWidth?: boolean;
    fixedHeader?: boolean;
    className?: {
      table?: string;
      header?: string;
      body?: string;
      row?: string;
      cell?: string;
      [key: string]: string | undefined;
    };
    style?: {
      table?: Partial<CSSStyleDeclaration>;
      header?: Partial<CSSStyleDeclaration>;
      body?: Partial<CSSStyleDeclaration>;
      row?: Partial<CSSStyleDeclaration>;
      cell?: Partial<CSSStyleDeclaration>;
      [key: string]: Partial<CSSStyleDeclaration> | undefined;
    };
    language?: {
      search?: { placeholder?: string };
      pagination?: {
        previous?: string;
        next?: string;
        showing?: string;
        results?: string | (() => string);
      };
      [key: string]: any;
    };
    widthResize?: boolean;
    [key: string]: any;
  }

  export class Grid<T = TCell> {
    constructor(config: Config<T>);
    render(element?: HTMLElement | string): this;
    updateConfig(config: Partial<Config<T>>): this;
    forceRender(): this;
    updateData(data: Data): this;
    clear(): this;
    // Possibly other methods – you can extend as needed
  }
}
