export interface SignInDto {
    email: string;
    password: string;
}

export interface AuthUserDto {
    id: string;
    email: string;
    siteId: string | null;
    systemRole: 'SUPER_ADMIN' | 'ADMIN' | 'CUSTOMER';
}

export interface SignInResponseDto {
    accessToken: string;
    expiresIn: number;
    user: AuthUserDto;
}
export interface SignUpDto {
    fullName: string;
    email: string;
    password: string;
}
