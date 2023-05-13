// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { getServerSession } from "next-auth/next"
import { authOptions } from './api/auth/[...nextauth]'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useState } from "react";
import homePageStyles from '../css/home.module.css'
import TableContent from "../utils/table-builder/buildTables"
import {
    homeMyProjectsTableSchema,
    homeMyComponentsTableSchema,
    homeMyTaskAssignmentsTableSchema,
    homeMyTaskSubmissionsTableSchema
} from '../utils/table-schema/homePageTableSchemas'
import defaultHomeMyProjectsValues from
        '../../defaultValues/defaultValuesHome-MyProjects.json'
import defaultHomeMyComponentsValues from
        '../../defaultValues/defaultValuesHome-MyComponents.json'
import defaultHomeMyTaskAssignmentsValues from
        '../../defaultValues/defaultValuesHome-MyTaskAssignments.json'
import defaultHomeMyTaskSubmissionsValues from
        '../../defaultValues/defaultValuesHome-MyTaskSubmissions.json'
import defaultHomeMySubscriptionsValues from
        '../../defaultValues/defaultValuesHome-MySubscriptions.json'
import defaultHomeMyRecentComponentsValues from
        '../../defaultValues/defaultValuesHome-MyRecentComponents.json'
import defaultHomeMyRecentReleasesValues from
        '../../defaultValues/defaultValuesHome-MyRecentReleases.json'


import {MyProjectData,
        MyComponentData,
        MyTaskAssignmentData,
        MyTaskSubmissionData,
        MySubscriptionData,
        MyRecentComponentData,
        MyRecentReleaseData} from '../services/home.service'

export default function HomePage() {

    const [projData, setProjData] = useState(defaultHomeMyProjectsValues);
    const [compData, setCompData] = useState(defaultHomeMyComponentsValues);
    const [taskAssignmentData, setTaskAssignmentData] = useState(
                                        defaultHomeMyTaskAssignmentsValues);
    const [taskSubmissionData, setTaskSubmissionData] = useState(
                                        defaultHomeMyTaskSubmissionsValues);
    const [mySubscriptionsData, setMySubscriptionsData] = useState(
                                        defaultHomeMySubscriptionsValues);
    const [myRecentComponentsData, setMyRecentComponentsData] = useState(
                                        defaultHomeMyRecentComponentsValues);
    const [myRecentReleasesData, setMyRecentReleasesData] = useState(
                                        defaultHomeMyRecentReleasesValues);

    const homeTableItemCount = 5;

    // Fetch my project data for my project table at home page
    const handleMyProjectData = (projData: any) => {

        console.log('Data received from my-project-home-service:', projData);
        if (projData != null){
            setProjData(projData["_embedded"]["sw360:projects"]);
        }
      };

    // Fetch my component data for my component table at home page
    const handleMyComponentData = (compData: any) => {

        console.log('Data received from my-comp-home-service:', compData);
        if (compData != null){
            setCompData(compData["_embedded"]["sw360:components"]);
        }
      };

    // Fetch my task assignment data for my task assignment table at home page
    const handleMyTaskAssignmentData = (assignmentData: any) => {

        console.log('Data received from my-task-assignment-home-service:', assignmentData);
        if (assignmentData != null){
            setTaskAssignmentData(assignmentData["_embedded"]["sw360:assignments"]);
        }
      };

    // Fetch my task submission data for my task submission table at home page
    const handleMyTaskSubmissionData = (taskSubmissionData: any) => {

        console.log('Data received from my-task-submission-home-service:', taskSubmissionData);
        if (taskSubmissionData != null){
            setTaskSubmissionData(taskSubmissionData["_embedded"]["sw360:taskSubmissions"]);
        }
      };

    // Fetch my subscriptions data at home page
    const handleMySubscriptionsData = (mySubscriptionsData: any) => {

        console.log('Data received from my-subscriptions-home-service:', mySubscriptionsData);
        if (mySubscriptionsData != null){
            setMySubscriptionsData(mySubscriptionsData["_embedded"]["sw360:components"]);
        }
      };

    // Fetch my recent components data at home page
    const handleMyRecentComponentsData = (myRecentComponentsData: any) => {

        console.log('Data received from my-recent-components-home-service:', myRecentComponentsData);
        if (myRecentComponentsData != null){
            setMyRecentComponentsData(myRecentComponentsData["_embedded"]["sw360:components"]);
        }
      };

    // Fetch my recent releases data at home page
    const handleMyRecentReleasesData = (myRecentReleasesData: any) => {

        console.log('Data received from my-recent-releases-home-service:', myRecentReleasesData);
        if (myRecentReleasesData != null){
            setMyRecentReleasesData(myRecentReleasesData["_embedded"]["sw360:releases"]);
        }
      };

    // Call the ChildComponents as a function before the return statement
    MyProjectData({ onMyProjData: handleMyProjectData });
    MyComponentData({ onCompData: handleMyComponentData });
    MyTaskAssignmentData({ onTaskAssignmentData: handleMyTaskAssignmentData });
    MyTaskSubmissionData({ onTaskSubmissionData: handleMyTaskSubmissionData });
    MySubscriptionData({ onMySubscriptions: handleMySubscriptionsData });
    MyRecentComponentData({ onMyRecentComponents: handleMyRecentComponentsData });
    MyRecentReleaseData({ onMyRecentReleases: handleMyRecentReleasesData });


    return (
        <div className={`content-container container-fluid ${homePageStyles.homePage}`}>
            <div className="row">
                <div className="col col-md-10">
                    <div className="row">
                        <div className="col-sm" id="sw360_table_col">
                            <div className={`d-flex justify-content-between ${homePageStyles.title}`}>
                                <div className="d-flex">

                                    <h5 className={`fw-bold ${homePageStyles.boldText}`}>My Projects</h5>
                                    <div className={`dropdown ${homePageStyles.dropDown}`}>
                                        <button className={`btn btn-sm btn-outline-primary dropdown-toggle ${homePageStyles.btnOutlinePrimary}`} type="button"
                                                id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false"
                                                >
                                            <i className="bi bi-chevron-down"></i>
                                        </button>
                                        <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                                            <li className="mx-5">
                                                <h6 className="text-capitalize fw-bolder">Role in Project</h6>
                                            </li>
                                            <li><hr className={homePageStyles.horizontalLine}/></li>
                                            <li className="mx-5">
                                                <div className="form-check dropdown-item">
                                                    <input className="form-check-input" type="checkbox" value="" id="creator" />
                                                    <label className="form-check-label text-capitalize fs-6" htmlFor="creator">Creator</label>
                                                </div>
                                            </li>
                                            <li className="mx-5">
                                                <div className="form-check dropdown-item">
                                                    <input className="form-check-input" type="checkbox" value="" id="moderator" />
                                                    <label className="form-check-label text-capitalize fs-6" htmlFor="moderator">Moderator</label>
                                                </div>
                                            </li>
                                            <li className="mx-5">
                                                <div className="form-check dropdown-item">
                                                    <input className="form-check-input" type="checkbox" value="" id="contributor" />
                                                    <label className="form-check-label text-capitalize fs-6" htmlFor="contributor">Contributor</label>
                                                </div>
                                            </li>
                                            <li className="mx-5">
                                                <div className="form-check dropdown-item">
                                                    <input className="form-check-input" type="checkbox" value="" id="projectOwner" />
                                                    <label className="form-check-label text-capitalize fs-6" htmlFor="projectOwner">Project owner</label>
                                                </div>
                                            </li>
                                            <li className="mx-5">
                                                <div className="form-check dropdown-item">
                                                    <input className="form-check-input" type="checkbox" value="" id="leadArchitect" />
                                                    <label className="form-check-label text-capitalize fs-6" htmlFor="leadArchitect">Lead architect</label>
                                                </div>
                                            </li>
                                            <li className="mx-5">
                                                <div className="form-check dropdown-item">
                                                    <input className="form-check-input" type="checkbox" value="" id="projectResponsible" />
                                                    <label className="form-check-label text-capitalize fs-6" htmlFor="projectResponsible">Project responsible</label>
                                                </div>
                                            </li>
                                            <li className="mx-5">
                                                <div className="form-check dropdown-item">
                                                    <input className="form-check-input" type="checkbox" value="" id="securityResponsible" />
                                                    <label className="form-check-label text-capitalize fs-6" htmlFor="securityResponsible">Security responsible</label>
                                                </div>
                                            </li>
                                            <li><hr /></li>
                                            <li className="mx-5">
                                                <h6 className="text-capitalize fw-bolder">Clearing state</h6>
                                            </li>
                                            <li><hr /></li>
                                            <li className="mx-5">
                                                <div className="form-check dropdown-item">
                                                    <input className="form-check-input" type="checkbox" value="" id="open" />
                                                    <label className="form-check-label text-capitalize fs-6" htmlFor="open">Open</label>
                                                </div>
                                            </li>
                                            <li className="mx-5">
                                                <div className="form-check dropdown-item">
                                                    <input className="form-check-input" type="checkbox" value="" id="closed" />
                                                    <label className="form-check-label text-capitalize fs-6" htmlFor="closed">Closed</label>
                                                </div>
                                            </li>
                                            <li className="mx-5">
                                                <div className="form-check dropdown-item">
                                                    <input className="form-check-input" type="checkbox" value="" id="inProgress" />
                                                    <label className="form-check-label text-capitalize fs-6" htmlFor="inProgress">In progress</label>
                                                </div>
                                            </li>
                                            <li><hr /></li>
                                            <li>
                                                <div className="text-center">
                                                    <button type="button" className={`btn btn-md btn-primary me-2 fw-bold text-capitalize ${homePageStyles.buttonPrimary}`}
                                                            data-bs-toggle="modal" data-bs-target="#exampleModal">Search</button>
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                                <button className='btn refresh-button'>
                                    <i className={`bi bi-arrow-repeat ${homePageStyles.refreshIcon}`}></i>
                                </button>
                            </div>
                            <hr className={homePageStyles.horizontalLine}></hr>
                            <TableContent schema={homeMyProjectsTableSchema} data={projData} tableItemCount={homeTableItemCount} />
                        </div>
                        <div className="col-sm" id="sw360_table_col">
                            <div className={`d-flex justify-content-between ${homePageStyles.title}`}>
                                <h5 className={`fw-bold ${homePageStyles.boldText}`}>My Components</h5>
                                <button className='btn refresh-button'>
                                    <i className={`bi bi-arrow-repeat ${homePageStyles.refreshIcon}`}></i>
                                </button>
                            </div>
                            <hr className={homePageStyles.horizontalLine}></hr>
                            <TableContent schema={homeMyComponentsTableSchema} data={compData} tableItemCount={homeTableItemCount} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm" id="sw360_table_col">
                            <div className={`d-flex justify-content-between ${homePageStyles.title}`}>
                                <h5 className={`fw-bold ${homePageStyles.boldText}`}>My Task Assignments</h5>
                                <button className='btn refresh-button'>
                                    <i className={`bi bi-arrow-repeat ${homePageStyles.refreshIcon}`}></i>
                                </button>
                            </div>
                            <hr className={homePageStyles.horizontalLine}></hr>
                            <TableContent schema = {homeMyTaskAssignmentsTableSchema} data = {taskAssignmentData} tableItemCount={homeTableItemCount} />
                        </div>
                        <div className="col-sm" id="sw360_table_col">
                            <div className={`d-flex justify-content-between ${homePageStyles.title}`}>
                                <h5 className={`fw-bold ${homePageStyles.boldText}`}>My Task Submissions</h5>
                                <button className='btn refresh-button'>
                                    <i className={`bi bi-arrow-repeat ${homePageStyles.refreshIcon}`}></i>
                                </button>
                            </div>
                            <hr className={homePageStyles.horizontalLine}></hr>
                            <TableContent schema = {homeMyTaskSubmissionsTableSchema} data = {taskSubmissionData} tableItemCount={homeTableItemCount} />
                        </div>
                    </div>
                </div>
                <div className="col col-md-2">
                    <div className="mb-4">
                        <h5 className={`fw-bold ${homePageStyles.titleSideBar}`}>My Subscriptions</h5>
                        <div className="content-container">
                            <ul style={{ listStyleType: "disc", color: "black" }}>
                                {mySubscriptionsData.map((item) => (
                                    <li key={""}>
                                        <span style={{ color: "orange"}}>{item.name}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="mb-4">
                        <h5 className={`fw-bold ${homePageStyles.titleSideBar}`}>Recent Components</h5>
                        <div className="content-container">
                            <ul style={{ listStyleType: "disc", color: "black" }}>
                                {myRecentComponentsData.map((item) => (
                                    <li key={""}>
                                        <span style={{ color: "orange"}}>{item.name}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="mb-4">
                        <h5 className={`fw-bold ${homePageStyles.titleSideBar}`}>Recent Releases</h5>
                        <div className="content-container">
                            <ul style={{ listStyleType: "disc", color: "black" }}>
                                {myRecentReleasesData.map((item) => (
                                    <li key={""}>
                                        <span style={{ color: "orange"}}>{item.name}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export async function getServerSideProps({ req, res, locale }: any) {
    return {
        props: {
            session: await getServerSession(req, res, authOptions),
            ...(await serverSideTranslations(locale, ['common'])),
        }
    }
  }
