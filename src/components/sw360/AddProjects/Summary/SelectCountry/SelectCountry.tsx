// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import React from 'react'
import { getData } from 'country-list'
import { Form } from 'react-bootstrap'

export default function SelectCountryComponent() {

    return(
        <>
            <Form.Group className="mb-3" controlId="addProjects.ownerCountry">
                <Form.Label className="fw-bold">Owner Country</Form.Label>
                <Form.Select defaultValue="" aria-label="Owner Country">
                    <option value="">Select a country</option>
                    {getData().map((country: any) => (
                        <option key={country.code} value={country.code}>
                            {country.name}
                    </option>
                    ))}
                </Form.Select>
            </Form.Group>
        </>
    );
}
