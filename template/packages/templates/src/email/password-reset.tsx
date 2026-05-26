import { Button, Link, Section, Text } from '@react-email/components';
import { render, toPlainText } from '@react-email/render';
import { EmailLayout } from './components/email-layout';

export interface PasswordResetEmailProps {
  appName: string;
  name?: string | null;
  resetUrl: string;
  expiresIn?: string;
}

export default function PasswordResetEmail({
  appName,
  name,
  resetUrl,
  expiresIn = '1 hour',
}: PasswordResetEmailProps) {
  const recipientName = name?.trim() || 'there';

  return (
    <EmailLayout
      appName={appName}
      heading="Reset your password"
      preview={`Create a new password for your ${appName} account.`}
    >
      <Text className="m-0 text-[16px] leading-[26px] text-slate-700">Hello {recipientName},</Text>
      <Text className="m-0 mt-[16px] text-[16px] leading-[26px] text-slate-700">
        We received a request to reset the password for your {appName} account. Use the button below
        to choose a new password.
      </Text>
      <Section className="py-[24px] text-center">
        <Button
          href={resetUrl}
          className="rounded-[10px] bg-blue-600 px-[24px] py-[14px] text-[15px] font-semibold text-white no-underline"
        >
          Reset password
        </Button>
      </Section>
      <Text className="m-0 text-[14px] leading-[22px] text-slate-500">
        This link expires in {expiresIn}.
      </Text>
      <Text className="m-0 mt-[18px] text-[14px] leading-[22px] text-slate-500">
        If the button does not open, copy and paste this link into your browser:
      </Text>
      <Link
        href={resetUrl}
        className="mt-[8px] block break-all text-[14px] leading-[22px] text-blue-600 underline"
      >
        {resetUrl}
      </Link>
      <Text className="m-0 mt-[24px] text-[14px] leading-[22px] text-slate-500">
        If you did not request a password reset, you can ignore this email. Your current password
        stays the same.
      </Text>
    </EmailLayout>
  );
}

export async function generatePasswordResetEmail(props: PasswordResetEmailProps) {
  const subject = `Reset Your Password — ${props.appName}`;
  const html = await render(<PasswordResetEmail {...props} />);

  return { subject, html, text: toPlainText(html) };
}
