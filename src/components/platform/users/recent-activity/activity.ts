export interface Activity {
    id: number;
    icon: string;
    color: string;

    title: string;
    description: string;

    user: string;

    time: string;
}

export const ACTIVITIES: Activity[] = [
    {
        id: 1,
        icon: 'bi-plus-circle-fill',
        color: '#2563eb',
        title: 'Created a new workspace',
        description: 'Acme Corporation',
        user: 'Emma',
        time: '2 mins ago',
    },
    {
        id: 2,
        icon: 'bi-window-stack',
        color: '#0ea5e9',
        title: 'Published a website',
        description: 'Landing Page',
        user: 'Michael',
        time: '15 mins ago',
    },
    {
        id: 3,
        icon: 'bi-stars',
        color: '#16a34a',
        title: 'Upgraded subscription',
        description: 'Business → Enterprise',
        user: 'Sophia',
        time: '1 hour ago',
    },
    {
        id: 4,
        icon: 'bi-person-plus-fill',
        color: '#8b5cf6',
        title: 'Invited a new member',
        description: 'Role: Editor',
        user: 'John',
        time: 'Yesterday',
    },
];
