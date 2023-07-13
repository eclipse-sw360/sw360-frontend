"use client"

import { Container, Row, Col } from "react-bootstrap"
import Clearing from "./Clearing/Clearing"
import Lifecycle from "./Lifecycle/Lifecycle"
import LicenseInfoHeader from "./LicenseInfoHeader/LicenceInfoHeader"

export default function AdministrationView() {
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