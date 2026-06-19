import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "@/components/LanguageSelector";
import { isAuthenticated, getAuthRole } from "@/lib/auth";
import { resolvePostLoginRedirect } from "@/lib/auth-redirect";
import { getDefaultRouteForRole } from "@/lib/permissions";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { findUserByEmail, saveCustomUser } from "@/lib/user-accounts";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

type SignInSearch = {
  redirect?: string;
};

export const Route = createFileRoute("/sign-in")({
  head: () => ({ meta: [{ title: "Sign In · GovLingua AI" }] }),
  validateSearch: (search: Record<string, unknown>): SignInSearch => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  beforeLoad: ({ search }) => {
    if (isAuthenticated()) {
      const role = getAuthRole() ?? "user";
      throw redirect({ to: search.redirect ?? getDefaultRouteForRole(role) });
    }
  },
  component: SignInPage,
});

function SignInPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLanguage();
  const { redirect: redirectTo } = Route.useSearch();

  const [mode, setMode] = useState<"signIn" | "createAccount">("signIn");
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("");
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showSignUpConfirmPassword, setShowSignUpConfirmPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const hasMinLength = signUpPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(signUpPassword);
  const hasNumber = /[0-9]/.test(signUpPassword);
  const isPasswordValid = hasMinLength && hasUppercase && hasNumber;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail || !signInPassword) {
      toast.error(t("auth.fillAllFields"));
      return;
    }

    setIsSigningIn(true);
    try {
      const result = login(signInEmail, signInPassword);
      if (result.success) {
        toast.success(t("auth.welcomeBack", { name: result.session.name }));
        navigate({ to: resolvePostLoginRedirect(result.session.role, redirectTo) });
      } else if (result.error === "invalid_credentials") {
        toast.error(t("auth.invalidCredentials"));
      } else if (result.error === "account_disabled") {
        toast.error(t("auth.accountDisabled"));
      } else {
        toast.error(t("auth.loginError"));
      }
    } catch {
      toast.error(t("auth.loginError"));
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpName || !signUpEmail || !signUpPassword || !signUpConfirmPassword) {
      toast.error(t("auth.fillAllFields"));
      return;
    }
    if (!isPasswordValid) {
      toast.error(t("auth.passwordRequirements"));
      return;
    }
    if (signUpPassword !== signUpConfirmPassword) {
      toast.error(t("auth.passwordMismatch"));
      return;
    }

    setIsRegistering(true);
    try {
      if (findUserByEmail(signUpEmail)) {
        toast.error(t("auth.emailExists"));
        setIsRegistering(false);
        return;
      }

      saveCustomUser({
        name: signUpName,
        email: signUpEmail,
        password: signUpPassword,
        role: "user",
        office: "Public",
        status: "Active",
      });

      toast.success(t("auth.accountCreated"));

      const loginResult = login(signUpEmail, signUpPassword);
      if (loginResult.success) {
        navigate({ to: resolvePostLoginRedirect(loginResult.session.role, redirectTo) });
      } else {
        setMode("signIn");
        setSignInEmail(signUpEmail);
      }
    } catch {
      toast.error(t("auth.registerError"));
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#f4f6f9] dark:bg-[#121a22] px-4 py-12">
      <div className="absolute left-4 top-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#163a5f] hover:underline dark:text-[#3d6a94]"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("signIn.backHome")}
        </Link>
      </div>

      <div className="absolute right-4 top-4">
        <LanguageSelector triggerClassName="h-9 w-[130px] rounded-md border border-gray-200 bg-white hover:bg-slate-50 gap-2 text-foreground font-medium text-xs [&>span]:w-full" />
      </div>

      <div className="w-full max-w-[460px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none p-8 md:p-10 z-10">
        {mode === "signIn" ? (
          <form onSubmit={handleSignIn} className="space-y-5">
            <div className="flex flex-col items-center text-center mb-6">
              <Link to="/">
                <Logo showText={false} />
              </Link>
              <span className="font-display text-lg font-bold tracking-tight mt-2">
                <span className="text-[#163a5f] dark:text-[#3d6a94]">Gov</span>
                <span className="text-[#2f6b4f] dark:text-[#4d8a6a]">Lingua</span>{" "}
                <span className="text-[#c9a227] dark:text-[#d4b44a]">AI</span>
              </span>
              <h2 className="font-display text-2xl font-bold text-[#163a5f] dark:text-foreground mt-4">
                {t("auth.signIn")}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">{t("auth.signInSubtitle")}</p>
            </div>

            <Field label={t("auth.email")} placeholder={t("auth.emailPlaceholder")} type="email" value={signInEmail} onChange={setSignInEmail} />
            <PasswordField
              label={t("auth.password")}
              placeholder={t("auth.passwordPlaceholder")}
              value={signInPassword}
              onChange={setSignInPassword}
              show={showSignInPassword}
              onToggle={() => setShowSignInPassword(!showSignInPassword)}
            />

            <div className="text-right">
              <button
                type="button"
                onClick={() => toast.info(t("auth.recoveryHint"))}
                className="text-xs font-semibold text-[#1a73e8] hover:underline cursor-pointer"
              >
                {t("auth.forgotPassword")}
              </button>
            </div>

            <Button type="submit" disabled={isSigningIn} className="w-full bg-[#163a5f] hover:bg-[#163a5f]/95 text-white font-semibold rounded-lg h-11 text-sm shadow-md">
              {isSigningIn ? t("auth.signingIn") : t("auth.signInBtn")}
            </Button>

            <Divider label={t("auth.or")} />

            <p className="text-center text-sm text-muted-foreground">
              {t("auth.noAccount")}{" "}
              <button type="button" onClick={() => setMode("createAccount")} className="text-[#1a73e8] font-bold hover:underline">
                {t("auth.createAccount")}
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleCreateAccount} className="space-y-4">
            <div className="flex flex-col items-center text-center mb-5">
              <Link to="/">
                <Logo showText={false} />
              </Link>
              <span className="font-display text-lg font-bold tracking-tight mt-2">
                <span className="text-[#163a5f] dark:text-[#3d6a94]">Gov</span>
                <span className="text-[#2f6b4f] dark:text-[#4d8a6a]">Lingua</span>{" "}
                <span className="text-[#c9a227] dark:text-[#d4b44a]">AI</span>
              </span>
              <h2 className="font-display text-2xl font-bold text-[#163a5f] dark:text-foreground mt-3">
                {t("auth.createAccount")}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">{t("auth.createAccountSubtitle")}</p>
            </div>

            <Field label={t("auth.fullName")} placeholder={t("auth.namePlaceholder")} value={signUpName} onChange={setSignUpName} />
            <Field label={t("auth.email")} placeholder={t("auth.emailPlaceholder")} type="email" value={signUpEmail} onChange={setSignUpEmail} />
            <PasswordField
              label={t("auth.password")}
              placeholder={t("auth.createPasswordPlaceholder")}
              value={signUpPassword}
              onChange={setSignUpPassword}
              show={showSignUpPassword}
              onToggle={() => setShowSignUpPassword(!showSignUpPassword)}
            />
            <PasswordField
              label={t("auth.confirmPassword")}
              placeholder={t("auth.confirmPasswordPlaceholder")}
              value={signUpConfirmPassword}
              onChange={setSignUpConfirmPassword}
              show={showSignUpConfirmPassword}
              onToggle={() => setShowSignUpConfirmPassword(!showSignUpConfirmPassword)}
            />

            <div className="py-1">
              <div className="text-xs text-muted-foreground font-semibold mb-1">{t("auth.passwordRules")}</div>
              <ul className="text-xs space-y-1 text-muted-foreground pl-4 list-disc font-medium">
                <li className={hasMinLength ? "text-emerald-600 dark:text-emerald-400 font-semibold" : ""}>{t("auth.rule.length")}</li>
                <li className={hasUppercase ? "text-emerald-600 dark:text-emerald-400 font-semibold" : ""}>{t("auth.rule.upper")}</li>
                <li className={hasNumber ? "text-emerald-600 dark:text-emerald-400 font-semibold" : ""}>{t("auth.rule.number")}</li>
              </ul>
            </div>

            <Button type="submit" disabled={isRegistering} className="w-full bg-[#163a5f] hover:bg-[#163a5f]/95 text-white font-semibold rounded-lg h-11 text-sm shadow-md">
              {isRegistering ? t("auth.registering") : t("auth.createAccountBtn")}
            </Button>

            <Divider label={t("auth.or")} />

            <p className="text-center text-sm text-muted-foreground">
              {t("auth.hasAccount")}{" "}
              <button type="button" onClick={() => setMode("signIn")} className="text-[#1a73e8] font-bold hover:underline">
                {t("auth.signIn")}
              </button>
            </p>
          </form>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 -z-10 h-40 w-full overflow-hidden pointer-events-none opacity-50">
        <svg viewBox="0 0 1440 120" className="absolute bottom-0 w-full h-auto fill-[#163a5f]/10 dark:fill-slate-800/10">
          <path d="M0,32L120,42.7C240,53,480,75,720,74.7C960,75,1200,53,1320,42.7L1440,32L1440,120L1320,120C1200,120,960,120,720,120C480,120,240,120,120,120L0,120Z" />
        </svg>
        <svg viewBox="0 0 1440 120" className="absolute bottom-0 w-full h-auto fill-[#2f6b4f]/5 dark:fill-slate-800/5">
          <path d="M0,64L80,58.7C160,53,320,43,480,48C640,53,800,75,960,85.3C1120,96,1280,96,1360,96L1440,96L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" />
        </svg>
      </div>

      <div className="text-xs text-muted-foreground mt-8 z-10">{t("auth.copyright")}</div>
    </div>
  );
}

function Field({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-bold text-[#163a5f] dark:text-[#a8b4c0] uppercase tracking-wider mb-2 block">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-50/50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 h-11 text-sm transition-all focus:bg-white focus:border-[#163a5f] focus:outline-none focus:ring-1 focus:ring-[#163a5f] dark:focus:bg-slate-900"
        required
      />
    </div>
  );
}

function PasswordField({
  label,
  placeholder,
  value,
  onChange,
  show,
  onToggle,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-bold text-[#163a5f] dark:text-[#a8b4c0] uppercase tracking-wider mb-2 block">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-slate-50/50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg pl-4 pr-11 py-2.5 h-11 text-sm transition-all focus:bg-white focus:border-[#163a5f] focus:outline-none focus:ring-1 focus:ring-[#163a5f] dark:focus:bg-slate-900"
          required
        />
        <button type="button" onClick={onToggle} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center my-6">
      <div className="flex-1 border-t border-gray-200 dark:border-slate-800" />
      <span className="px-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
      <div className="flex-1 border-t border-gray-200 dark:border-slate-800" />
    </div>
  );
}
