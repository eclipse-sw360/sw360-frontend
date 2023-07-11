"use client"

import { Container, Row, Col } from "react-bootstrap"

export default function AdministrationView() {
    return (
        <>
            <Container>
                <Row className="mb-4">
                    <Row className={`header mb-2`}>
                        <h6 className="my-2">Clearing</h6>
                    </Row>
                    <Row>
                        <Col lg={4}>{"Project Clearing State"}:</Col>
                        <Col>{"Open"}</Col>
                        <hr className="my-2" />
                    </Row>
                    <Row>
                        <Col lg={4}>{"Clearing Details"}:</Col>
                        <Col>{"New releases: 9 , Under clearing: 0 (and 0 already uploaded), Report available: 5 , Approved: 37"}</Col>
                        <hr className="my-2" />
                    </Row>
                    <Row>
                        <Col lg={4}>{"Clearing Team"}:</Col>
                        <Col></Col>
                        <hr className="my-2" />
                    </Row>
                    <Row>
                        <Col lg={4}>{"Deadline for pre-evaluation"}:</Col>
                        <Col>{""}</Col>
                        <hr className="my-2" />
                    </Row>
                    <Row>
                        <Col lg={4}>{"Clearing summary"}:</Col>
                            <Col>{""}</Col>
                            <hr className="my-2" />
                        </Row>
                    <Row>
                        <Col lg={4}>{"Special risk Open Source Software"}:</Col>
                        <Col>{"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras eu augue viverra, eleifend ante ac, auctor lectus. Mauris interdum ullamcorper imperdiet. Vestibulum tempor, massa ut dignissim sagittis, urna dolor eleifend ligula, in venenatis nisl odio quis massa. Nulla fermentum eros cursus leo viverra suscipit. Vivamus aliquam mi quis tortor congue, eu gravida est ornare. Sed diam mauris, vulputate quis tortor ut, tincidunt eleifend lectus. Fusce sollicitudin erat et cursus imperdiet. Sed tristique in libero sit amet malesuada."}</Col>
                        <hr className="my-2" />
                    </Row>
                    <Row>
                        <Col lg={4}>{"General risks 3rd party software"}:</Col>
                        <Col>{""}</Col>
                        <hr className="my-2" />
                    </Row>
                    <Row>
                        <Col lg={4}>{"Special risks 3rd party software"}:</Col>
                        <Col>{"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras eu augue viverra, eleifend ante ac, auctor lectus. Mauris interdum ullamcorper imperdiet. Vestibulum tempor, massa ut dignissim sagittis, urna dolor eleifend ligula, in venenatis nisl odio quis massa. Nulla fermentum eros cursus leo viverra suscipit. Vivamus aliquam mi quis tortor congue, eu gravida est ornare. Sed diam mauris, vulputate quis tortor ut, tincidunt eleifend lectus. Fusce sollicitudin erat et cursus imperdiet. Sed tristique in libero sit amet malesuada."}</Col>
                        <hr className="my-2" />
                    </Row>
                    <Row>
                        <Col lg={4}>{"Sales and delivery channels"}:</Col>
                        <Col>{""}</Col>
                        <hr className="my-2" />
                    </Row>
                    <Row>
                        <Col lg={4}>{"Remarks additional requirements"}:</Col>
                        <Col>{""}</Col>
                        <hr className="my-2" />
                    </Row>
                </Row>
                <Row className="mb-4">
                    <Row className={`header mb-2`}>
                        <h6 className="my-2">Lifecycle</h6>
                    </Row>
                    <Row>
                        <Col lg={4}>{"Project state"}:</Col>
                        <Col>{"Active"}</Col>
                        <hr className="my-2" />
                    </Row>
                    <Row>
                        <Col lg={4}>{"System State Begin"}:</Col>
                        <Col>{""}</Col>
                        <hr className="my-2" />
                    </Row>
                    <Row>
                        <Col lg={4}>{"System State End"}:</Col>
                        <Col>{""}</Col>
                        <hr className="my-2" />
                    </Row>
                    <Row>
                        <Col lg={4}>{"Delivery start"}:</Col>
                        <Col></Col>
                        <hr className="my-2" />
                    </Row>
                    <Row>
                        <Col lg={4}>{"Phase-out since"}:</Col>
                        <Col></Col>
                        <hr className="my-2" />
                    </Row>
                </Row>
                <Row className="mb-4">
                    <Row className={`header mb-2`}>
                        <h6 className="my-2">License Info Header</h6>
                    </Row>
                    <Row>
                        {`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer at hendrerit sem, eu elementum felis. Sed ultricies pharetra enim, sit amet eleifend urna dictum non. Etiam sodales leo sed diam posuere, non pharetra mauris ornare. Nam commodo metus lacinia egestas scelerisque. Fusce egestas sodales est vel gravida. Ut suscipit tempor luctus. Integer risus leo, rutrum id pellentesque sed, tristique in quam.

Proin sed pharetra velit, et malesuada metus. Sed non augue sapien. Vestibulum ac elementum arcu, convallis accumsan ex. Quisque nunc eros, eleifend a diam eu, mollis lacinia justo. Duis id sollicitudin dui. Morbi bibendum malesuada tincidunt. Pellentesque gravida libero urna, sit amet ultrices augue maximus laoreet. Vivamus at porta justo. Morbi in malesuada sem, sed vulputate dolor. Duis tortor velit, pretium efficitur ipsum vitae, pulvinar vestibulum dolor. Cras urna urna, pharetra quis porttitor ut, vulputate a sapien. Integer ac eleifend mauris, a mattis leo. Nunc ac ante finibus, consequat ex ut, mollis tellus. Sed ultricies maximus lorem et aliquam. Vestibulum vehicula mi ut tellus rutrum iaculis.

Nullam gravida auctor egestas. Praesent pharetra sapien nec tempor lobortis. Vestibulum et convallis ante. Maecenas sagittis luctus eleifend. Nulla ut fermentum odio, at sollicitudin tellus. Proin et pellentesque mauris, ut dignissim justo. Pellentesque fringilla sagittis finibus. Etiam dictum in augue ac scelerisque. Morbi varius feugiat lobortis. Mauris eu accumsan neque, et sagittis lacus. Sed accumsan consectetur auctor. Nunc ac urna orci. Nam et neque eu metus ultricies feugiat eu quis tellus. Vivamus vulputate, nisi eu posuere porta, dui enim ornare arcu, vitae pulvinar lacus nulla ac velit.`}
                    </Row>
                </Row>
            </Container>
        </>
    )
}