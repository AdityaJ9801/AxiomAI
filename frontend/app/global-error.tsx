'use client';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body>
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#050810',
                    color: '#f0f6ff',
                    fontFamily: 'system-ui, sans-serif'
                }}>
                    <div style={{
                        textAlign: 'center',
                        padding: '2rem',
                        maxWidth: '500px'
                    }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Something went wrong!</h2>
                        <p style={{ marginBottom: '2rem', color: '#8898aa' }}>
                            An unexpected error occurred. Please try again.
                        </p>
                        <button
                            onClick={() => reset()}
                            style={{
                                padding: '0.75rem 1.5rem',
                                background: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5rem',
                                cursor: 'pointer'
                            }}
                        >
                            Try again
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}