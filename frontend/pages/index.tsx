import Link from 'next/link';
import Head from 'next/head';

export default function Home() {
    return (
        <>
            <Head>
                <title>LearnLynk - Technical Assessment Home</title>
                <meta
                    name="description"
                    content="Welcome to LearnLynk Technical Assessment. View completed tasks: Database Schema, RLS Policies, Edge Function, Dashboard Page, and Stripe Integration."
                />
                <meta property="og:title" content="LearnLynk - Technical Assessment Home" />
                <meta
                    property="og:description"
                    content="Task Management System with Supabase integration and Next.js"
                />
            </Head>

            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="max-w-2xl mx-auto px-4 py-16 text-center">
                    <h1 className="text-6xl font-bold text-gray-900 mb-6">
                        LearnLynk
                    </h1>
                    <p className="text-xl text-gray-600 mb-8">
                        Technical Assessment - Task Management System
                    </p>
                    <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                            Quick Links
                        </h2>
                        <div className="space-y-4">
                            <Link
                                href="/dashboard/today"
                                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                            >
                                📋 View Today's Tasks
                            </Link>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-xl p-8">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                            Assessment Tasks
                        </h2>
                        <ul className="text-left space-y-2 text-gray-700">
                            <li className="flex items-start">
                                <span className="text-green-500 mr-2">✓</span>
                                <span><strong>Task 1:</strong> Database Schema (schema.sql)</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-green-500 mr-2">✓</span>
                                <span><strong>Task 2:</strong> RLS Policies (rls_policies.sql)</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-green-500 mr-2">✓</span>
                                <span><strong>Task 3:</strong> Edge Function (create-task)</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-green-500 mr-2">✓</span>
                                <span><strong>Task 4:</strong> Dashboard Page (today.tsx)</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-green-500 mr-2">✓</span>
                                <span><strong>Task 5:</strong> Stripe Integration (README.md)</span>
                            </li>
                        </ul>
                    </div>
                    <div className="mt-8 text-sm text-gray-500">
                        <p>Note: Configure Supabase environment variables in .env.local to connect</p>
                    </div>
                </div>
            </div>
        </>
    );
}
