// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

export const homeMyProjectsTableSchema = [
    {
        Header: "Project Name",
        accessor: "name"
    },
    {
        Header: "Description",
        accessor: "version",
        Cell: (props:any) => {
            return (<>
                <style jsx>{`p {margin-top: 0.5rem; margin-bottom: 0.5rem;}`}</style>
                <p>{props.value.slice(0,30)}...</p></>);}
    },
    {
        Header: "Approved Releases",
        accessor: "projectType",
        Cell: (row:any) => <div style={{ textAlign: "center" }}>{row.value}</div>
    }
]

export const homeMyComponentsTableSchema = [
    {
        Header: "Component Name",
        accessor: "name"
    },
    {
        Header: "Description",
        accessor: "description",
        Cell: (props:any) => {
            return (<>
                <style jsx>{`p {margin-top: 0.5rem; margin-bottom: 0.5rem;}`}</style>
                <p>{props.value.slice(0,30)}...</p></>);}
    }
]

export const homeMyTaskAssignmentsTableSchema = [
    {
        Header: "Document Name",
        accessor: "documentName",
        Cell: (props:any) => {

            return (<>
                <style jsx>{`p {margin-top: 0.5rem; margin-bottom: 0.5rem;}`}</style>
                <p>{props.value.slice(0,30)}...</p></>);}
    },
    {
        Header: "Status",
        accessor: "status"
    }
]

export const homeMyTaskSubmissionsTableSchema = [
    {
        Header: "Document Name",
        accessor: "documentName",
        Cell: (props:any) => {
            return (<>
                <style jsx>{`p {margin-top: 0.5rem; margin-bottom: 0.5rem;}`}</style>
                <p>{props.value.slice(0,30)}...</p></>);}
    },
    {
        Header: "Status",
        accessor: "status"
    },
    {
        Header: "Actions",
        accessor: "actions"
    }
]
