import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'AXIOM AI — Agentic Data Analysis Platform',
    description: 'Next-generation AI-powered data analysis platform that automates insights, cleaning, regression, time-series forecasting and professional report generation.',
    keywords: ['data analysis', 'AI', 'machine learning', 'econometrics', 'time series', 'data cleaning'],
    authors: [{ name: 'AXIOM AI Team' }],
    openGraph: {
        title: 'AXIOM AI — Agentic Data Analysis Platform',
        description: 'Automate your data analysis workflow with AI-powered agents.',
        type: 'website',
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" data-scroll-behavior="smooth">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
            </head>
            <body>{children}</body>
        </html>
    );
}