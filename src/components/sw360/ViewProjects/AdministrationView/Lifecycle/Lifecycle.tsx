"use client"

export default function Lifecycle() {

    return (
        <>
            <div className="row mb-4">
                <div className="row header mb-2">
                    <h6>Lifecycle</h6>
                </div>
                <div className="row">
                    <div className="col-lg-4">{"Project state"}:</div>
                    <div className="col">{"Active"}</div>
                    <hr className="my-2" />
                </div>
                <div className="row">
                    <div className="col-lg-4">{"System State Begin"}:</div>
                    <div className="col"></div>
                    <hr className="my-2" />
                </div>
                <div className="row">
                    <div className="col-lg-4">{"System State End"}:</div>
                    <div className="col"></div>
                    <hr className="my-2" />
                </div>
                <div className="row">
                    <div className="col-lg-4">{"Delivery start"}:</div>
                    <div className="col"></div>
                    <hr className="my-2" />
                </div>
                <div className="row">
                    <div className="col-lg-4">{"Phase-out since"}:</div>
                    <div className="col"></div>
                    <hr className="my-2" />
                </div>
            </div>
        </>
    )
}