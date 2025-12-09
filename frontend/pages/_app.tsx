import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function App({ Component, pageProps }: AppProps) {
    return (
        <>
            <Head>
                {/* Default SEO Meta Tags */}
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="theme-color" content="#2563eb" />

                {/* Default Title and Description */}
                <title>LearnLynk - Technical Assessment</title>
                <meta
                    name="description"
                    content="LearnLynk Technical Assessment - Task Management System built with Next.js, TypeScript, and Supabase"
                />

                {/* Favicon */}
                <link rel="icon" href="/favicon.ico" />

                {/* Open Graph / Social Media */}
                <meta property="og:type" content="website" />
                <meta property="og:title" content="LearnLynk - Technical Assessment" />
                <meta
                    property="og:description"
                    content="Task Management System built with Next.js, TypeScript, and Supabase"
                />

                {/* Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="LearnLynk - Technical Assessment" />
                <meta
                    name="twitter:description"
                    content="Task Management System built with Next.js, TypeScript, and Supabase"
                />
            </Head>

            <ErrorBoundary>
                <Component {...pageProps} />
            </ErrorBoundary>
        </>
    );
}
