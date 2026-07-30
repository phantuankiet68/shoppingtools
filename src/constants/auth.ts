export const AUTH = {
    ACCESS_TOKEN_EXPIRES: '2h',
    REFRESH_TOKEN_EXPIRES: '30d',

    ACCESS_TOKEN_TTL: 60 * 60 * 2,
    REFRESH_TOKEN_TTL: 60 * 60 * 24 * 30,

    ACCESS_COOKIE_NAME: 'kbuilder_access',
    REFRESH_COOKIE_NAME: 'kbuilder_refresh',

    BCRYPT_ROUNDS: 10,

    ACCESS_TOKEN_ISSUER: 'kbuilder',
    ACCESS_TOKEN_AUDIENCE: 'kbuilder-user',
} as const;
