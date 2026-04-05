import type { EmailTemplateData, TemplateId } from '@/features/email/types';
import WelcomeTemplate from './WelcomeTemplate';
import PromotionTemplate from './PromotionTemplate';
import ReminderTemplate from './ReminderTemplate';

type Props = {
  templateId: TemplateId;
  data: EmailTemplateData;
};

export default function EmailTemplatePreview({ templateId, data }: Props) {
  if (templateId === 'promotion') {
    return <PromotionTemplate data={data} />;
  }

  if (templateId === 'reminder') {
    return <ReminderTemplate data={data} />;
  }

  return <WelcomeTemplate data={data} />;
}