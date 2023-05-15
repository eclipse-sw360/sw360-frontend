// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { useEffect, useState } from "react";
import RequestContent from "@/object-types/RequestContent";
import HttpStatus from "@/object-types/enums/HttpStatus";
import { NEXT_PUBLIC_SW360_API_BASE_URL, AUTH_TOKEN } from "@/utils/env";


// Fetch project data at project page
export function ProjectDetails(props: any) {

    const [projData, setProjData] = useState(null);
    const getProjectData = async () => {

        const fetchProjectsURL: string = NEXT_PUBLIC_SW360_API_BASE_URL + '/projects?page=6&page_entries=10';
        const opts: RequestContent = { method: 'GET', headers: {}, body: null };

        opts.headers['Content-Type'] = 'application/json';
        opts.headers['Authorization'] = `Token ${AUTH_TOKEN}`;

        const fetchProjectData = fetch(fetchProjectsURL, opts)
            .then((response) => {
                if (response.status == HttpStatus.OK) {
                    return response.json();
                }
                else {
                    return null;
                }
            })
            .then(data => {
                data["_embedded"]["sw360:projects"].forEach((singleProjectData : any) => {

                    const fectProjectDetailsUrl : string = singleProjectData["_links"]["self"]["href"]
                    console.log('inner fetch link', fectProjectDetailsUrl)
                    const fetchProjectDescription = fetch(fectProjectDetailsUrl, opts)
                        .then((projectResponse) => {
                            if (projectResponse.status == HttpStatus.OK) {
                                return projectResponse.json();
                            }
                            else {
                                return null;
                            }
                        })
                        .then((projectDetails) => {
                            singleProjectData["description"] = projectDetails["description"]
                            singleProjectData["projectResponsible"] = projectDetails["projectResponsible"]
                        });
                });

                return data
            })
            .then((data) => {
                console.log('after setting descr and proj res', data)
                setProjData(data)
                props.onMyProjList(data);
            });
    }
    // Call fetchData() when component mounts
    useEffect(() => {
        getProjectData();
    }, []);

}
