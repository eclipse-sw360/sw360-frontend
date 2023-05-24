// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { CellProps } from "@/types/table";

export const projectTableSchema = [
    {
        Header: "Project Name",
        accessor: "name",
        isSortable: true
    },
    {
        Header: "Description",
        accessor: "version",
        isSortable: true,
        Cell: (props: CellProps) => {
            // const value = props?.value;
            const valueLength = props.value?.length ?? 0;
            if (valueLength > 30)
                return (<>
                    <style jsx>
                        {`p {margin-top: 0.5rem; margin-bottom: 0.5rem;}`}
                    </style>
                    <p>
                        {props.value.slice(0, 30)}...
                    </p>
                </>);
            else
                return (<>
                    <style jsx>
                        {`p {margin-top: 0.5rem; margin-bottom: 0.5rem;}`}
                    </style>
                    <p>
                        {props.value}
                    </p>
                </>);
        }
    },
    {
        Header: "Project Responsible",
        accessor: "visibility",
        isSortable: true,
        Cell: (props: CellProps) => {
            // const value = props?.value;
            const valueLength = props.value?.length ?? 0;
            if (valueLength > 30)
                return (<>
                    <style jsx>
                        {`p {margin-top: 0.5rem; margin-bottom: 0.5rem;}`}
                    </style>
                    <p>
                        {props.value.slice(0, 30)}...
                    </p>
                </>);
            else
                return (<>
                    <style jsx>
                        {`p {margin-top: 0.5rem; margin-bottom: 0.5rem;}`}
                    </style>
                    <p>
                        {props.value}
                    </p>
                </>);

        }
    },
    {
        Header: "License  Clearing",
        accessor: "licenseClearing",
        isSortable: true
    },
    {
        Header: "State",
        accessor: "state",
        isSortable: false,
        Cell: () => {
            return (<>
                <style jsx>{`
                    .rowContainer {
                        display: flex !important;
                        align-items: center;
                        justify-content: center !important;

                    }
                    .psContainer {
                        background-color:#68c17c !important;
                        color:white !important;
                        text-align:center !important;
                        padding: 5px !important;
                        border-radius: 7px !important;
                    }
                    .csContainer {
                        background-color:#e6717c !important;
                        color:white !important;
                        text-align:center !important;
                        padding: 5px !important;
                        border-radius: 7px !important;
                    }

                `}</style>
                <div className="rowContainer">
                    <div className="psContainer" typeof="button">PS</div>

                    <div className="csContainer" typeof="button">CS</div>
                </div>

            </>
            );
        }
    },
    {
        Header: "Actions",
        accessor: "actions",
        isSortable: false,
        Cell: () => {
            return (<>
                <style jsx>
                    {
                        `.container-fluid {
                        width: 80% !important;
                        justify-content:center !important;
                    }`
                    }
                </style>
                <div className="container-fluid">
                    <i className="bi bi-pencil btn" ></i>
                    <i className="bi bi-check2-square btn"></i>
                    <i className="bi bi-clipboard btn"></i>
                    <i className="bi bi-archive btn"></i>
                </div>

            </>
            );
        }

    }
]
