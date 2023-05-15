// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import projectPageStyles from "@/css/projects.module.css"
import TableContent from "../../utils/table-builder/buildTables"
import { projectTableSchema } from '../../utils/table-schema/projectTableSchema'
import Link from "next/link"
import { useState } from "react"
import {ProjectDetails} from '../../services/projects.service'
import defaultProjectsProjectsList from
        '../../../defaultValues/defaultValuesProjects-ProjectsList.json'


export default function Project() {

  const [projList, setProjList] = useState(defaultProjectsProjectsList);
  const projectTableItemCount = 10;

  // Fetch my project data for my project table at home page
  const handleMyProjectDataList = (projList: any) => {

    console.log('Data received from project-service:', projList);
    if (projList != null){
        console.log('before setting proj data', projList)
        setProjList(projList["_embedded"]["sw360:projects"]);
    }
  };

  ProjectDetails({ onMyProjList: handleMyProjectDataList });

  return (
    <div className="ms-5 me-5 mt-1">
      <div className="row mt-2">
        <div className="col col-sm-3">
          <div className="card mb-4">
            <div className={projectPageStyles['card-header']}>
              <p className="fw-bold m-3">Advanced Search</p>
            </div>
            <div className={projectPageStyles.cardBody}>
              <div className="mb-3">
                <label htmlFor="projectName" className="form-label fw-bold">Project Name</label>
                <input type="text" className="form-control" id="projectName" />
              </div>
              <div className="mb-3">
                <label htmlFor="projectVersion" className="form-label fw-bold">Project Version</label>
                <input type="text" className="form-control" id="projectVersion" />
              </div>
              <div className="mb-3">
                <label htmlFor="projectType" className="form-label fw-bold">Project Type</label>
                <select className="form-select" id="projectType" aria-label="project type select">
                  <option selected></option>
                  <option value="Customer Project">Customer Project</option>
                  <option value="Internal Project">Internal Project</option>
                  <option value="Product">Product</option>
                  <option value="Service">Service</option>
                  <option value="Inner Source">Inner Source</option>
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="projectResponsible" className="form-label fw-bold">Project Responsible (Email)</label>
                <input type="text" className="form-control" id="projectResponsible" />
              </div>
              <div className="mb-3">
                <label htmlFor="group" className="form-label fw-bold">Group</label>
                <select className="form-select" id="group" aria-label="group select">
                  <option selected></option>
                  <option value="Department">Department</option>
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="state" className="form-label fw-bold">State</label>
                <select className="form-select" id="state" aria-label="state select">
                  <option selected></option>
                  <option value="Active">Active</option>
                  <option value="Phase Out">Phase Out</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="state" className="form-label fw-bold">State</label>
                <select className="form-select" id="state" aria-label="state select">
                  <option selected></option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="tag" className="form-label fw-bold">Tag</label>
                <input type="text" className="form-control" id="tag" />
              </div>
              <div className="mb-4">
                <label htmlFor="additionalData" className="form-label fw-bold">Additional Data</label>
                <input type="text" className="form-control" id="additionalData" />
              </div>
              <button type="button" className={`fw-bold btn ${projectPageStyles['button-search']}`}>Search</button>
            </div>
          </div>
        </div>
        <div className="col col-sm-9">
          <div className="col">
            <div className="row">
              <div className="col-lg-3">
                <div className="btn-group d-flex mb-2" role="group" aria-label="Project Utilities">
                  <Link type="button" className={`fw-bold btn btn-primary ${projectPageStyles['button']}`} href="http://localhost:3000/projects/add/summary" >Add Project</Link>
                  <button type="button" className={`fw-bold btn btn-light ${projectPageStyles['button-plain']}`}>Import SBOM</button>
                </div>
              </div>
              <div className="col-lg-3">
                <div className="dropdown">
                  <button className={`fw-bold btn btn-light ${projectPageStyles['button-plain']} dropdown-toggle`} type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    Export Spreadsheet
                  </button>
                  <ul className="dropdown-menu">
                    <li><button type="button" className="dropdown-item">Projects only</button></li>
                    <li><button type="button" className="dropdown-item">Projects with linked releases</button></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="row my-2">
              <div className="col-xl-2 d-flex">
                <p className="my-2">show</p>
                <select className="form-select form-select-sm mx-2" aria-label="page size select">
                  <option selected value={10}>10</option>
                  <option selected value={25}>25</option>
                  <option selected value={50}>50</option>
                  <option selected value={100}>100</option>
                </select>
                <p className="my-2">entries</p>
              </div>
              <div className="col-xl-1 d-flex">
                <button type="button" className={`fw-bold btn btn-light ${projectPageStyles['button-plain']}`}>Print <i className="bi bi-printer"></i></button>
              </div>
            </div>
            <div className="row">
              <TableContent schema={projectTableSchema} data={projList} tableItemCount = {projectTableItemCount}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
