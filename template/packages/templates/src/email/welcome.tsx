import { Button, Section, Text } from "@react-email/components";
import { render, toPlainText } from "@react-email/render";
import { EmailLayout } from "./components/email-layout";

export interface WelcomeEmailProps {
  appName: string;
  name?: string | null;
  dashboardUrl: string;
}

export default function WelcomeEmail({ appName, name, dashboardUrl }: WelcomeEmailProps) {
  const recipientName = name?.trim() || "there";

  return (
    <EmailLayout
      appName={appName}
      heading="Welcome aboard!"
      preview={`Your ${appName} account is ready.`}
    >
      <Text className="m-0 text-[16px] leading-[26px] text-slate-700">Hello {recipientName},</Text>
      <Text className="m-0 mt-[16px] text-[16px] leading-[26px] text-slate-700">
        Your {appName} account has been created. We're excited to have you on board.
      </Text>

      <Section className="py-[24px] text-center">
        <Button
          href={dashboardUrl}
          className="rounded-[10px] bg-blue-600 px-[24px] py-[14px] text-[15px] font-semibold text-white no-underline"
        >
          Go to your dashboard
        </Button>
      </Section>

      <Text className="m-0 text-[14px] leading-[22px] text-slate-500">
        If you have any questions, reply to this email and we'll get back to you.
      </Text>
    </EmailLayout>
  );
}

export async function generateWelcomeEmail(props: WelcomeEmailProps) {
  const subject = `Welcome to ${props.appName}!`;
  const html = await render(<WelcomeEmail {...props} />);

  return { subject, html, text: toPlainText(html) };
}
