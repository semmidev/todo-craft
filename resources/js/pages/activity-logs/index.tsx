import { Head } from '@inertiajs/react';
import { History, Shield, User } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

interface ActivityItem {
    id: number;
    log_name: string;
    description: string;
    subject_type: string;
    subject_id: number;
    causer?: {
        id: number;
        name: string;
        email: string;
    };
    properties: any;
    created_at: string;
}

interface PageProps {
    activities: {
        data: ActivityItem[];
        links: any[];
        meta: any;
    };
    currentTeam: {
        id: number;
        name: string;
        slug: string;
    };
}

export default function ActivityLogsIndex({ activities, currentTeam }: PageProps) {
    return (
        <>
            <Head title="Audit Trail Logs - Todo App" />

            <div className="space-y-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Team Activity & Audit Trail</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Recorded system actions and audit trail history.
                    </p>
                </div>

                <div className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
                    <div className="p-4 border-b border-border bg-muted/40 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-sm">System Audit History</h3>
                    </div>

                    {activities.data.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground">
                            <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No activity recorded yet.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {activities.data.map((act) => (
                                <div key={act.id} className="p-4 flex items-start gap-4 hover:bg-accent/20 transition">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-sm">
                                                {act.causer ? act.causer.name : 'System'}
                                            </span>
                                            <span className="text-xs text-muted-foreground">{act.created_at}</span>
                                        </div>
                                        <p className="text-sm text-foreground">{act.description}</p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                                            <span className="bg-accent px-2 py-0.5 rounded font-mono">
                                                {act.subject_type || 'General'} #{act.subject_id}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

ActivityLogsIndex.layout = (props: { currentTeam?: { slug: string } | null }) => ({
    breadcrumbs: [
        {
            title: 'Audit Trail Logs',
            href: props.currentTeam ? `/${props.currentTeam.slug}/activity-logs` : '#',
        },
    ],
});
