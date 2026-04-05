export type TemplateId = 'welcome' | 'promotion' | 'reminder';

export type EmailTemplateData = {
  campaignTitle: string;
  subject: string;
  content: string;
  ctaText: string;
  ctaUrl: string;

  promoCode?: string;
  productName?: string;
  productImage?: string;
  benefits?: string[];

  preheader?: string;
  footerBrandName?: string;
  footerSupportEmail?: string;
  footerAddress?: string;
  unsubscribeUrl?: string;
};

export type BuildEmailHtmlOptions = {
  previewText?: string;
};