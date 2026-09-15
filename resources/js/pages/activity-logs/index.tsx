import { Head } from '@inertiajs/react';
import { History, Shield, User } from 'lucide-react';
import Heading from '@/components/heading';

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

export default function ActivityLogsIndex({
    activities,
    currentTeam: _currentTeam,
}: PageProps) {
    return (
        <>
            <Head title="Audit Trail Logs - Todo App" />

            <div className="w-full flex-1 space-y-8 p-6 lg:p-8">
                <Heading
                    badge="Security & Audit"
                    title="Audit Trail Logs"
                    description={`Recorded system actions and audit trail history for ${_currentTeam.name}.`}
                />

                <div className="bg-card border-border overflow-hidden rounded-2xl border shadow-xs">
                    <div className="border-border bg-muted/40 flex items-center gap-2 border-b p-4">
                        <Shield className="text-primary h-5 w-5" />
                        <h3 className="text-sm font-semibold">
                            System Audit History
                        </h3>
                    </div>

                    {activities.data.length === 0 ? (
                        <div className="text-muted-foreground p-12 text-center">
                            <History className="mx-auto mb-3 h-12 w-12 opacity-50" />
                            <p>No activity recorded yet.</p>
                        </div>
                    ) : (
                        <div className="divide-border divide-y">
                            {activities.data.map((act) => (
                                <div
                                    key={act.id}
                                    className="hover:bg-accent/20 flex items-start gap-4 p-4 transition"
                                >
                                    <div className="bg-primary/10 text-primary mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                                        <User className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold">
                                                {act.causer
                                                    ? act.causer.name
                                                    : 'System'}
                                            </span>
                                            <span className="text-muted-foreground text-xs">
                                                {act.created_at}
                                            </span>
                                        </div>
                                        <p className="text-foreground text-sm">
                                            {act.description}
                                        </p>
                                        <div className="text-muted-foreground flex items-center gap-2 pt-1 text-xs">
                                            <span className="bg-accent rounded px-2 py-0.5 font-mono">
                                                {act.subject_type || 'General'}{' '}
                                                #{act.subject_id}
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

ActivityLogsIndex.layout = (props: {
    currentTeam?: { slug: string } | null;
}) => ({
    breadcrumbs: [
        {
            title: 'Audit Trail Logs',
            href: props.currentTeam
                ? `/${props.currentTeam.slug}/activity-logs`
                : '#',
        },
    ],
});
