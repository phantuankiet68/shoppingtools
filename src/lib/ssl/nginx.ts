import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function testNginx() {
    return execAsync('nginx -t');
}

export async function reloadNginx() {
    return execAsync('systemctl reload nginx');
}
