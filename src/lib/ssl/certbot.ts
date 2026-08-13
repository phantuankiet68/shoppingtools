import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface IssueCertificateOptions {
    domain: string;
    email: string;
}

export async function issueCertificate({ domain, email }: IssueCertificateOptions) {
    const command = [
        'certbot',
        '--nginx',
        '--non-interactive',
        '--agree-tos',
        `-m ${email}`,
        `-d ${domain}`,
    ].join(' ');

    return execAsync(command);
}
