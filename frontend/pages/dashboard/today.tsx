// Dashboard page to show tasks due today
// Uses React Query for data fetching and mutations

import { useState } from 'react';
import Head from 'next/head';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';


interface Task {
    id: string;
    type: 'call' | 'email' | 'review';
    application_id: string;
    due_at: string;
    status: string;
    description?: string;
}

export default function TodayPage() {
    const queryClient = useQueryClient();

    // Fetch tasks due today
    const { data: tasks = [], isLoading, error, refetch } = useQuery({
        queryKey: ['tasks', 'today'],
        queryFn: async () => {
            // Calculate start and end of today
            const now = new Date();
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

            const { data, error } = await supabase
                .from('tasks')
                .select('id, type, application_id, due_at, status, description')
                .neq('status', 'completed')
                .gte('due_at', startOfDay.toISOString())
                .lt('due_at', endOfDay.toISOString())
                .order('due_at', { ascending: true });

            if (error) throw error;
            return data as Task[];
        },
    });

    // Update task status to completed
    const markCompleteMutation = useMutation({
        mutationFn: async (taskId: string) => {
            const { error } = await supabase
                .from('tasks')
                .update({
                    status: 'completed',
                    completed_at: new Date().toISOString()
                })
                .eq('id', taskId);

            if (error) throw error;
            return taskId;
        },
        onSuccess: () => {
            // Refresh tasks list
            queryClient.invalidateQueries({ queryKey: ['tasks', 'today'] });
        },
        onError: (err: Error) => {
            alert(err.message || 'Failed to update task');
        },
    });

    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTypeBadgeColor = (type: string) => {
        switch (type) {
            case 'call':
                return 'bg-blue-100 text-blue-800';
            case 'email':
                return 'bg-green-100 text-green-800';
            case 'review':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <>
            <Head>
                <title>Today's Tasks - LearnLynk</title>
                <meta
                    name="description"
                    content="View and manage tasks due today. Mark tasks as complete and track your progress."
                />
                <meta property="og:title" content="Today's Tasks - LearnLynk" />
                <meta
                    property="og:description"
                    content="Task dashboard showing tasks due today"
                />
            </Head>

            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Today's Tasks</h1>
                        <p className="mt-2 text-gray-600">
                            Tasks due today that need attention
                        </p>
                    </div>

                    {/* Loading state */}
                    {isLoading && (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    )}

                    {/* Error state */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <p className="text-red-800">Error: {error instanceof Error ? error.message : 'Failed to fetch tasks'}</p>
                            <button
                                onClick={() => refetch()}
                                className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
                            >
                                Try again
                            </button>
                        </div>
                    )}

                    {/* Tasks list */}
                    {!isLoading && !error && (
                        <>
                            {tasks.length === 0 ? (
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                                    <svg
                                        className="mx-auto h-12 w-12 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    <h3 className="mt-4 text-lg font-medium text-gray-900">
                                        No tasks due today
                                    </h3>
                                    <p className="mt-2 text-gray-500">
                                        You're all caught up! Enjoy your day.
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Type
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Application ID
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Due At
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Status
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Description
                                                    </th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Action
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {tasks.map((task) => (
                                                    <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(task.type)}`}>
                                                                {task.type}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <code className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                                                {task.application_id.substring(0, 8)}...
                                                            </code>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {formatTime(task.due_at)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(task.status)}`}>
                                                                {task.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-600">
                                                            {task.description || '-'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <button
                                                                onClick={() => markCompleteMutation.mutate(task.id)}
                                                                disabled={markCompleteMutation.isPending}
                                                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                {markCompleteMutation.isPending ? 'Updating...' : 'Mark Complete'}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Task count */}
                            {tasks.length > 0 && (
                                <div className="mt-4 text-sm text-gray-600 text-center">
                                    Showing {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} due today
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
