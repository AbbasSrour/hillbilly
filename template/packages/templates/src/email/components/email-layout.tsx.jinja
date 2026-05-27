import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';
import type { ReactNode } from 'react';

export interface EmailLayoutProps {
  appName: string;
  children: ReactNode;
  heading: string;
  preview: string;
  footer?: ReactNode;
}

export function EmailLayout({ appName, children, heading, preview, footer }: EmailLayoutProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Tailwind>
        <Body className="m-0 bg-slate-50 px-[16px] py-[32px] font-sans text-slate-800">
          <Container className="mx-auto max-w-[600px] overflow-hidden rounded-[20px] border border-solid border-slate-200 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
            <Section className="bg-slate-800 px-[32px] py-[28px] text-white">
              <Text className="m-0 text-[12px] font-semibold uppercase tracking-[2px] text-slate-300">
                {appName}
              </Text>
              <Text className="m-0 mt-[12px] text-[28px] font-semibold leading-[36px] text-white">
                {heading}
              </Text>
            </Section>
            <Section className="px-[32px] py-[32px]">{children}</Section>
            <Hr className="m-0 border-none border-t border-solid border-slate-200" />
            <Section className="px-[32px] py-[24px]">
              {footer ?? (
                <Text className="m-0 text-[13px] leading-[20px] text-slate-500">
                  This message was sent by {appName}. If you were not expecting it, you can safely
                  ignore it.
                </Text>
              )}
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
