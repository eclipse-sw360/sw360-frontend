// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import React, { useState, useEffect } from 'react'
import styles from "@/styles/Table.module.css"
import { ColumnType, Table } from "./table"

interface Props<T> {
    table: Table<T>;
    chooseValueFromTable?: (values: T | null) => void;
}

export default function SelectableTableComponent<T>({ table, chooseValueFromTable }: Props<T>): JSX.Element {

    const [input, setInput] = useState<(T | null)>(null);
    useEffect(() => { chooseValueFromTable && chooseValueFromTable(input) }, [input]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) : void => {
        const ind: number = parseInt(e.target.value);
        setInput(table.data[ind]);
    };

    return(
        <>
            <div className="table-responsive">
                <table className="table table-bordered">
                    <thead className={`${styles["column-header"]}`}>
                        <tr>
                            <th></th>
                            {table.columns.map((header, i) => (
                                <th scope="col">
                                    <div className={header.isSortable ? 'd-flex justify-content-between mt-3':'mt-3'}>
                                        <span>{header.title}</span>
                                        {header.isSortable && <i className="bi bi-arrow-down-up"></i>}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {table.data.length === 0 && <td colSpan={table.columns.length} style={{textAlign:"center"}}>{table.messageOnEmptyTable}</td>}
                            {
                                table.data.map((row, i) => (
                                    <tr>
                                        {
                                            <td>
                                                <input className="form-check-input"
                                                   type="radio"
                                                   name="selectRow"
                                                   value={i}
                                                   aria-label="Select Row"
                                                   onChange={handleChange}
                                                />
                                            </td>
                                        }
                                        {
                                            table.columns.map((elem, j) => {
                                                return (
                                                    <td className={j===0 ? `${styles["row-header"]}`: ""}>{elem.render(elem, row)}</td>
                                                );
                                            })
                                        }
                                    </tr>
                                ))
                            }
                    </tbody>
                </table>
                <div className="d-flex justify-content-between">
                    <p>Showing {1} to {1} of {1} entries</p>
                    <nav aria-label="Page navigation">
                    <ul className="pagination">
                        <li className="page-item"><a className="page-link" href="#">Previous</a></li>
                        <li className="page-item"><a className="page-link" href="#">1</a></li>
                        <li className="page-item"><a className="page-link" href="#">Next</a></li>
                    </ul>
                    </nav>
                </div>
            </div>
        </>
    );
}
