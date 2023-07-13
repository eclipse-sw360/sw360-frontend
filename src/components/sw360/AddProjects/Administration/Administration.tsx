"use client"

import Clearing from "./Clearing/Clearing"  
import Lifecycle from "./Lifecycle/Lifecycle"
import LicenseInfoHeader from "./LicenseInfoHeader/LicenseInfoHeader"

export default function Administration() {

    return (
        <>
            <div className="container">
                <Clearing/>
                <Lifecycle/>
                <LicenseInfoHeader/>
            </div>
        </>
    )
}