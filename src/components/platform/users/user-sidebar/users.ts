export interface UserItem {
    id: number;
    name: string;
    email: string;
    avatar: string;
    role: 'Customer' | 'Admin';
    online: boolean;
}

export const USERS: UserItem[] = [
    {
        id: 1,
        name: 'John Anderson',
        email: 'john@acme.com',
        avatar: '/assets/images/avatar-1.png',
        role: 'Customer',
        online: true,
    },
    {
        id: 2,
        name: 'Emma Wilson',
        email: 'emma@startup.io',
        avatar: '/assets/images/avatar-2.png',
        role: 'Admin',
        online: true,
    },
    {
        id: 3,
        name: 'Michael Brown',
        email: 'michael@agency.dev',
        avatar: '/assets/images/avatar-3.png',
        role: 'Customer',
        online: false,
    },
    {
        id: 4,
        name: 'Sophia Davis',
        email: 'sophia@builder.com',
        avatar: '/assets/images/avatar-4.png',
        role: 'Customer',
        online: true,
    },
];
