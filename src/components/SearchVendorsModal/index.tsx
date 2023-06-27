// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import React, { useState } from 'react'
import styles from "@/css/SearchModal.module.css"
import { Vendor } from "./Vendor"
// import SelectableTableComponent from "@/components/table/selectableTable"
// import { ColumnType, Table } from "@/components/table/table"

interface Props {
    chooseVendor: (vendor: Vendor | null) => void
};


export default function SearchVendorsModalComponent({ chooseVendor }: Props) : JSX.Element {

    const [vendor, setVendor] = useState<(Vendor | null)>(null);

    const chooseVendorFromTable = (v: Vendor | null): void => {
      setVendor(v);
    };

    return(
        <>
            <div className="modal fade" id="search_vendors_modal" tabIndex={-1} aria-labelledby="Search Vendors Modal" aria-hidden="true">
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title fw-bold" id="search_users_modal_label">Search Vendor</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className="row">
                                <div className="col-lg-6">
                                    <input type="text" className="form-control" placeholder="Enter search text..." aria-describedby="Search Vendor" />
                                </div>
                                <div className="col-lg-4">
                                    <button type="button" className={`fw-bold btn btn-light ${styles['button-plain']} me-2`}>Search</button>
                                </div>
                            </div>
                            <div className="row mt-3">
                                {/* <SelectableTableComponent chooseValueFromTable={chooseVendorFromTable} table={table} /> */}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" data-bs-dismiss="modal" className={`fw-bold btn btn-light ${styles['button-plain']} me-2`}>Close</button>
                            <button type="button" className={`fw-bold btn btn-light ${styles['button-plain']}`}>Add Vendor</button>
                            <button type="button" className={`fw-bold btn btn-light ${styles['button-orange']}`} onClick={() => chooseVendor(vendor)}>Select Vendor</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
