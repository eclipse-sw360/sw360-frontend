// Copyright (c) VAIBHAVSING, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

"use client"

import { useState } from 'react'
import { Alert, Button, Container, Row, Col } from 'react-bootstrap'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [isVisible, setIsVisible] = useState(true)
  
  if (!isVisible) {
    return (
      <div className="text-center py-5">
        <Button 
          variant="primary" 
          onClick={reset}
        >
          Try again
        </Button>
      </div>
    )
  }
  
  return (
    <Container fluid className="px-0">
      <Row className="m-0">
        <Col className="p-0">
          <Alert variant="danger" className="rounded-0 mb-0 shadow-sm">
            <div className="container">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                  <div className="me-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-exclamation-triangle-fill" viewBox="0 0 16 16">
                      <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                    </svg>
                  </div>
                  
                  <div>
                    <div className="fw-bold">Something went wrong!</div>
                    <div>{error.message}</div>
                    {error.digest !== undefined && error.digest !== '' && (
                      <small className="text-muted">Error ID: {error.digest}</small>
                    )}
                  </div>
                </div>
                <div className="d-flex gap-2 ms-3">
                  <Button 
                    variant="outline-danger"
                    size="sm"
                    onClick={() => setIsVisible(false)}
                    aria-label="Dismiss error message"
                  >
                    Dismiss
                  </Button>
                  <Button 
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      reset()
                    }}
                    aria-label="Try the operation again"
                  >
                    Try again
                  </Button>
                </div>
              </div>
            </div>
          </Alert>
        </Col>
      </Row>
    </Container>
  )
}