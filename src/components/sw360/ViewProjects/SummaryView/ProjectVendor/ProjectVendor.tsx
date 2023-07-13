"use client"

export default function ProjectVendor() {

    return (
        <>
            <div className="row mb-4">
                <div className="row header mb-2">
                    <h6>Project Version</h6>
                </div>
                <div className="row">
                    <div className="col-lg-4">{"Full Name"}:</div>
                    <div className="col"></div>
                    <hr className="my-2" />
                </div>
                <div className="row">
                    <div className="col-lg-4">{"Short Name"}:</div>
                    <div className="col"></div>
                    <hr className="my-2" />
                </div>
                <div className="row">
                    <div className="col-lg-4">{"URL"}:</div>
                    <div className="col"></div>
                    <hr className="my-2" />
                </div>
            </div>
        </>
    )
}