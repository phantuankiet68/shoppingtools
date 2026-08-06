export function validatePassword(password: string) {
    return {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[^A-Za-z0-9]/.test(password),
    };
}

export function isPasswordValid(password: string) {
    const rule = validatePassword(password);

    return rule.length && rule.uppercase && rule.lowercase && rule.number && rule.special;
}
