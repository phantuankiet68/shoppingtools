import { issueCertificate } from './certbot';
import { reloadNginx, testNginx } from './nginx';

interface ProvisionSslOptions {
    siteId: string;
    domain: string;
    email: string;
}

export async function provisionSsl({ siteId, domain, email }: ProvisionSslOptions) {
    void siteId;
    await issueCertificate({
        domain,
        email,
    });
    await testNginx();
    await reloadNginx();
    return {
        success: true,
        message: 'SSL certificate provisioned successfully.',
    };
}
