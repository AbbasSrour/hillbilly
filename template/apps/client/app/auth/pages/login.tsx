import { createFileRoute } from "@tanstack/react-router";
import { LoginForm } from "@/app/auth/components/form/login-form";
import { LoginHeader } from "@/app/auth/components/layout/login-header";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/auth/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      {
        title: "Login - [[ project_name ]]",
      },
      {
        name: "description",
        content:
          "Sign in to your [[ project_name ]] account to manage vouchers, track digital serial numbers, and access your organization's inventory management system.",
      },
      {
        property: "og:title",
        content: "Login - [[ project_name ]]",
      },
      {
        property: "og:description",
        content: "Sign in to access your voucher and digital serial number management platform.",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        name: "robots",
        content: "noindex, nofollow",
      },
    ],
  }),
});

function LoginPage() {
  return (
    <div className="relative min-h-svh">
      <img
        src="/images/login-bg.png"
        className="absolute top-0 left-0 z-0 h-full w-full bg-cover"
        alt="Login Background"
      />
      <div
        className="absolute top-0 right-0 z-5 flex h-full w-1/2 items-center justify-center"
        style={{
          clipPath: "polygon(15.38% 0%, 100% 0%, 100% 100%, 0% 100%)",
          backgroundColor: "#161616",
          backdropFilter: "blur(5.05px)",
        }}
      >
        <div className="flex flex-col items-center justify-center gap-10">
          <LoginHeader />
          <LoginForm />
          <div className="text-balance text-center text-xs text-white/60">
            {m.auth_login_footer()}
          </div>
        </div>
      </div>
    </div>
  );
}
