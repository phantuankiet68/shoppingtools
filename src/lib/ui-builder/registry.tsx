// lib/ui-builder/registry.ts
import type { RegItem } from '@/lib/ui-builder/types';

import { HEADER_SERVICE_01 } from '@/components/admin/shared/templates/services/headers/header-service-01';
import { HEADER_SERVICE_02 } from '@/components/admin/shared/templates/services/headers/header-service-02';
import { HEADER_SERVICE_03 } from '@/components/admin/shared/templates/services/headers/header-service-03';
import { HEADER_SERVICE_04 } from '@/components/admin/shared/templates/services/headers/header-service-04';
import { HEADER_SERVICE_05 } from '@/components/admin/shared/templates/services/headers/header-service-05';
import { HEADER_SERVICE_06 } from '@/components/admin/shared/templates/services/headers/header-service-06';
import { HEADER_SERVICE_07 } from '@/components/admin/shared/templates/services/headers/header-service-07';
import { HEADER_SERVICE_08 } from '@/components/admin/shared/templates/services/headers/header-service-08';
import { HEADER_SERVICE_09 } from '@/components/admin/shared/templates/services/headers/header-service-09';

import { FOOTER_SERVICE_01 } from '@/components/admin/shared/templates/services/footers/footer-service-01';
import { FOOTER_SERVICE_02 } from '@/components/admin/shared/templates/services/footers/footer-service-02';
import { FOOTER_SERVICE_03 } from '@/components/admin/shared/templates/services/footers/footer-service-03';
import { FOOTER_SERVICE_04 } from '@/components/admin/shared/templates/services/footers/footer-service-04';
import { FOOTER_SERVICE_05 } from '@/components/admin/shared/templates/services/footers/footer-service-05';
import { FOOTER_SERVICE_06 } from '@/components/admin/shared/templates/services/footers/footer-service-06';
import { FOOTER_SERVICE_07 } from '@/components/admin/shared/templates/services/footers/footer-service-07';
import { FOOTER_SERVICE_08 } from '@/components/admin/shared/templates/services/footers/footer-service-08';
import { FOOTER_SERVICE_09 } from '@/components/admin/shared/templates/services/footers/footer-service-09';

export const BASIC: RegItem[] = [];

export const REGISTRY_HOME: RegItem[] = [
    HEADER_SERVICE_01,
    HEADER_SERVICE_02,
    HEADER_SERVICE_03,
    HEADER_SERVICE_04,
    HEADER_SERVICE_05,
    HEADER_SERVICE_06,
    HEADER_SERVICE_07,
    HEADER_SERVICE_08,
    HEADER_SERVICE_09,
    FOOTER_SERVICE_01,
    FOOTER_SERVICE_02,
    FOOTER_SERVICE_03,
    FOOTER_SERVICE_04,
    FOOTER_SERVICE_05,
    FOOTER_SERVICE_06,
    FOOTER_SERVICE_07,
    FOOTER_SERVICE_08,
    FOOTER_SERVICE_09,
];

export const REGISTRY: RegItem[] = [...BASIC, ...REGISTRY_HOME];

export default REGISTRY;
