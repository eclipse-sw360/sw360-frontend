'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { type JSX } from 'react'
import sw360logo from '@/assets/images/sw360-logo.svg'

function NotFound(): JSX.Element {
    const router = useRouter()

    return (
        <html>
            <body>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '100vh',
                        fontFamily: 'sans-serif',
                        backgroundColor: '#fff',
                    }}
                >
                    <div
                        style={{
                            textAlign: 'center',
                            padding: '2rem',
                            maxWidth: '480px',
                        }}
                    >
                        <Image
                            src={sw360logo}
                            height={80}
                            width={247}
                            alt='SW360 Logo'
                            style={{
                                marginBottom: '1.5rem',
                            }}
                        />
                        <h1
                            style={{
                                fontSize: '6rem',
                                fontWeight: 'bold',
                                margin: '0',
                            }}
                        >
                            404
                        </h1>
                        <h2
                            style={{
                                fontWeight: 'bold',
                                marginTop: '0.5rem',
                            }}
                        >
                            Page Not Found
                        </h2>
                        <p
                            style={{
                                color: '#6c757d',
                                margin: '1rem 0 1.5rem',
                            }}
                        >
                            The page you are looking for does not exist or has been moved.
                        </p>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: '1rem',
                            }}
                        >
                            <button
                                onClick={() => router.back()}
                                style={{
                                    padding: '0.5rem 1.5rem',
                                    backgroundColor: '#6c757d',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                }}
                            >
                                Go Back
                            </button>
                            <button
                                onClick={() => router.push('/')}
                                style={{
                                    padding: '0.5rem 1.5rem',
                                    backgroundColor: '#6c757d',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                }}
                            >
                                Return Home
                            </button>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    )
}

export default NotFound
