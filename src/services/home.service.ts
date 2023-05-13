// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { NEXT_PUBLIC_SW360_API_BASE_URL, AUTH_TOKEN } from '@/utils/env';
import RequestContent from '@/object-types/RequestContent';
import HttpStatus from '@/object-types/enums/HttpStatus';
import { useEffect, useState } from 'react'

// Fetch my-project data at home page
export function MyProjectData(props: any) {

    const [projData, setProjData] = useState(null);
    // const [projData, setProjData] = useState(null);
    const [projDescription, setProjDescription] = useState(null);
    const getHomePageProjectData = async () => {

        let myProjectFetchURL: string = NEXT_PUBLIC_SW360_API_BASE_URL + '/projects/myprojects';
        const opts: RequestContent = { method: 'GET', headers: {}, body: null };

        opts.headers['Content-Type'] = 'application/json';
        opts.headers['Authorization'] = `Token ${AUTH_TOKEN}`;
        opts.headers['Access-Control-Allow-Origin'] = '*';

        const fetchProjectData = fetch(myProjectFetchURL, opts)
            .then((response) => {
                if (response.status == HttpStatus.OK) {
                    return response.json();
                }
                else {
                    return null;
                }
            })
            .then((data) => {
                const fectProjectDetailsUrl : string = '${data._embedded.sw360:projects[0]._links.self.href}'
                const fetchProjectData = fetch(fectProjectDetailsUrl, opts)
                        .then((response) => {
                            if (response.status == HttpStatus.OK) {
                                return response.json();
                            }
                            else {
                                return null;
                            }
                        })
                        .then((projectDetails) => {
                            console.log('*******************decription testing*********************' ,data["_embedded"]["sw360:projects"][0])
                            setProjDescription(projectDetails["description"])
                            data["_embedded"]["sw360:projects"][0]["description"] = projDescription
                        });

                console.log('home serice data',data)
                return data
            })
            .then((data) => {
                setProjData(data)
                props.onMyProjData(data);
            });
    }
    // Call fetchData() when component mounts
    useEffect(() => {
        getHomePageProjectData();
    }, []);

}

// Fetch my-component data at home page
export function MyComponentData(props: any) {

    const [compData, setCompData] = useState(null);
    const getHomePageComponentData = async () => {

        let myComponentFetchURL: string = NEXT_PUBLIC_SW360_API_BASE_URL + '/components/myComponents';
        const opts: RequestContent = { method: 'GET', headers: {}, body: null };

        opts.headers['Content-Type'] = 'application/json';
        opts.headers['Authorization'] = `Token ${AUTH_TOKEN}`;
        opts.headers['Access-Control-Allow-Origin'] = '*';

        const fetchComponentData = fetch(myComponentFetchURL, opts)
            .then((response) => {
                if (response.status == HttpStatus.OK) {
                    return response.json();
                }
                else {
                    return null;
                }
            })
            .then((data) => {
                setCompData(data)
                props.onCompData(data);
            });
    }
    // Call fetchData() when component mounts
    useEffect(() => {
        getHomePageComponentData();
    }, []);

}

// Fetch my-task-assignments data at home page
export function MyTaskAssignmentData(props: any) {

    const [taskAssignmentData, setTaskAssignmentData] = useState(null);
    const getHomePageTaskAssignmentData = async () => {

        let myTaskAssignmentFetchURL: string = NEXT_PUBLIC_SW360_API_BASE_URL + '/myTaskAssignments';
        const opts: RequestContent = { method: 'GET', headers: {}, body: null };

        opts.headers['Content-Type'] = 'application/json';
        opts.headers['Authorization'] = `Token ${AUTH_TOKEN}`;
        opts.headers['Access-Control-Allow-Origin'] = '*';

        const fetchMyTaskAssignmentData = fetch(myTaskAssignmentFetchURL, opts)
            .then((response) => {
                if (response.status == HttpStatus.OK) {
                    return response.json();
                }
                else {
                    return null;
                }
            })
            .then((data) => {
                setTaskAssignmentData(data)
                props.onTaskAssignmentData(data);
            });
    }
    // Call fetchData() when component mounts
    useEffect(() => {
        getHomePageTaskAssignmentData();
    }, []);

}

// Fetch my-task-submissions data at home page
export function MyTaskSubmissionData(props: any) {

    const [taskSubmissionData, setTaskSubmissionData] = useState(null);
    const getHomePageTaskSubmissionData = async () => {

        let myTaskSubmissionFetchURL: string = NEXT_PUBLIC_SW360_API_BASE_URL + '/myTaskSubmissions';
        const opts: RequestContent = { method: 'GET', headers: {}, body: null };

        opts.headers['Content-Type'] = 'application/json';
        opts.headers['Authorization'] = `Token ${AUTH_TOKEN}`;
        opts.headers['Access-Control-Allow-Origin'] = '*';

        const fetchMyTaskSubmissionData = fetch(myTaskSubmissionFetchURL, opts)
            .then((response) => {
                if (response.status == HttpStatus.OK) {
                    return response.json();
                }
                else {
                    return null;
                }
            })
            .then((data) => {
                setTaskSubmissionData(data)
                props.onTaskSubmissionData(data);
            });
    }
    // Call fetchData() when component mounts
    useEffect(() => {
        getHomePageTaskSubmissionData();
    }, []);

}

// Fetch my-subscriptions data at home page
export function MySubscriptionData(props: any) {

    const [mySubscriptions, setMySubscriptions] = useState(null);
    const getHomePageMySubscriptions = async () => {

        let mySubscriptionsFetchURL: string = NEXT_PUBLIC_SW360_API_BASE_URL + '/components/mySubscriptions';
        const opts: RequestContent = { method: 'GET', headers: {}, body: null };

        opts.headers['Content-Type'] = 'application/json';
        opts.headers['Authorization'] = `Token ${AUTH_TOKEN}`;
        opts.headers['Access-Control-Allow-Origin'] = '*';

        const fetchMySubscriptions = fetch(mySubscriptionsFetchURL, opts)
            .then((response) => {
                if (response.status == HttpStatus.OK) {
                    return response.json();
                }
                else {
                    return null;
                }
            })
            .then((data) => {
                setMySubscriptions(data)
                props.onMySubscriptions(data);
            });
    }
    // Call fetchData() when component mounts
    useEffect(() => {
        getHomePageMySubscriptions();
    }, []);

}

// Fetch my-recent-components data at home page
export function MyRecentComponentData(props: any) {

    const [myRecentComponents, setMyRecentComponents] = useState(null);
    const getHomePageMyRecentComponents = async () => {

        let myRecentComponentsFetchURL: string = NEXT_PUBLIC_SW360_API_BASE_URL + '/components/recentComponents';
        const opts: RequestContent = { method: 'GET', headers: {}, body: null };

        opts.headers['Content-Type'] = 'application/json';
        opts.headers['Authorization'] = `Token ${AUTH_TOKEN}`;
        opts.headers['Access-Control-Allow-Origin'] = '*';

        const fetchMyRecentComponents = fetch(myRecentComponentsFetchURL, opts)
            .then((response) => {
                if (response.status == HttpStatus.OK) {
                    return response.json();
                }
                else {
                    return null;
                }
            })
            .then((data) => {
                setMyRecentComponents(data)
                props.onMyRecentComponents(data);
            });
    }
    // Call fetchData() when component mounts
    useEffect(() => {
        getHomePageMyRecentComponents();
    }, []);

}

// Fetch my-recent-releases data at home page
export function MyRecentReleaseData(props: any) {

    const [myRecentReleases, setMyRecentReleases] = useState(null);
    const getHomePageMyRecentReleases = async () => {

        let myRecentReleasesFetchURL: string = NEXT_PUBLIC_SW360_API_BASE_URL + '/releases/recentReleases';
        const opts: RequestContent = { method: 'GET', headers: {}, body: null };

        opts.headers['Content-Type'] = 'application/json';
        opts.headers['Authorization'] = `Token ${AUTH_TOKEN}`;
        opts.headers['Access-Control-Allow-Origin'] = '*';

        const fetchMyRecentReleases = fetch(myRecentReleasesFetchURL, opts)
            .then((response) => {
                if (response.status == HttpStatus.OK) {
                    return response.json();
                }
                else {
                    return null;
                }
            })
            .then((data) => {
                setMyRecentReleases(data)
                props.onMyRecentReleases(data);
            });
    }
    // Call fetchData() when component mounts
    useEffect(() => {
        getHomePageMyRecentReleases();
    }, []);

}
