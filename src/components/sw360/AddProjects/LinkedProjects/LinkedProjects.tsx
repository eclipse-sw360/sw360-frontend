"use client"

import LinkReleases from "./LinkReleases/LinkReleases"
import LinkProjects from "./LinkProjects/LinkProjects"

export default function LinkedProjects() {
    
    return (
        <>
            <div className="container">
                <LinkProjects/>
                <LinkReleases/>
            </div>
        </>
    )
}