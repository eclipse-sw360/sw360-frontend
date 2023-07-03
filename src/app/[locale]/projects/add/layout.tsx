import React from 'react'
import Link from "next/link"
import styles from '../projects.module.css'

export default function ProjectLayout({
    children
  }: {
    children: React.ReactNode
  }) {
    return (
        <div className="mx-5 mt-1">
            <div className="row mt-2">
                <div className="col col-sm-2">
                    <div className="list-group">
                        <Link href="/projects/add/summary">Summary</Link>
                        <Link href="/projects/add/administration">Administration</Link>
                        <Link href="/projects/add/linkedProjects">Linked Releases and Projects</Link>
                    </div>
                </div>
                <div className="col col-sm-10">
                    <div className="row mb-5">
                            <button type="button" className={`fw-bold btn btn-primary ${styles['button-orange']} me-2 col-lg-2`}>Create Project</button>
                            <button type="button" className={`fw-bold btn btn-light ${styles['button-plain']} col-lg-2`}>Cancel</button>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    )
  }