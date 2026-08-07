export interface Workspace {
    id: number;
    name: string;
    role: string;
    owner: string;
    sites: number;
    members: number;
    plan: string;
    storageUsed: number;
    storageTotal: number;
    lastActivity: string;

    icon: string;
    accent: string;
}
export const WORKSPACES: Workspace[] = [
    {
        id: 1,
        name: 'Acme Corporation',
        role: 'Owner',
        owner: 'Mollie',
        sites: 5,
        members: 8,
        plan: 'Business',
        storageUsed: 12.4,
        storageTotal: 50,
        lastActivity: '2 hours ago',
        icon: 'bi-globe2',
        accent: '#2563eb',
    },
    {
        id: 2,
        name: 'Creative Studio',
        role: 'Owner',
        owner: 'Emma',
        sites: 3,
        members: 5,
        plan: 'Standard',
        storageUsed: 8.7,
        storageTotal: 25,
        lastActivity: '1 day ago',
        icon: 'bi-palette2',
        accent: '#8b5cf6',
    },
    {
        id: 3,
        name: 'NextGen Agency',
        role: 'Owner',
        owner: 'Michael',
        sites: 9,
        members: 16,
        plan: 'Enterprise',
        storageUsed: 41,
        storageTotal: 100,
        lastActivity: 'Yesterday',
        icon: 'bi-building',
        accent: '#10b981',
    },
    {
        id: 4,
        name: 'Personal Workspace',
        role: 'Owner',
        owner: 'John',
        sites: 2,
        members: 1,
        plan: 'Free',
        storageUsed: 1.2,
        storageTotal: 5,
        lastActivity: '5 mins ago',
        icon: 'bi-person-workspace',
        accent: '#f59e0b',
    },
];
