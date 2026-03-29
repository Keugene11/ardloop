export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-bg">
      <main className="max-w-md mx-auto px-5 pt-8 pb-16">
        <h1 className="text-[24px] font-extrabold tracking-tight mb-6">
          Privacy Policy
        </h1>
        <div className="text-[14px] leading-relaxed text-text-muted space-y-4">
          <p>
            <strong className="text-text">Last updated:</strong> March 29, 2026
          </p>

          <p>
            Ardsleypost ("we", "our", or "us") operates the Ardsleypost mobile
            application and website. This page informs you of our policies
            regarding the collection, use, and disclosure of personal
            information.
          </p>

          <h2 className="text-[16px] font-semibold text-text pt-2">
            Information We Collect
          </h2>
          <p>
            When you create an account, we collect your name, email address, and
            profile photo via Google Sign-In. When you use the app, we collect
            the content you post, comments, likes, and messages you send.
          </p>

          <h2 className="text-[16px] font-semibold text-text pt-2">
            How We Use Your Information
          </h2>
          <p>
            We use your information to provide and improve the Ardsleypost
            service, display your profile to other users, deliver messages, and
            send relevant notifications.
          </p>

          <h2 className="text-[16px] font-semibold text-text pt-2">
            Data Storage
          </h2>
          <p>
            Your data is stored securely using Supabase (hosted on AWS).
            We do not sell your personal information to third parties.
          </p>

          <h2 className="text-[16px] font-semibold text-text pt-2">
            Third-Party Services
          </h2>
          <p>
            We use Google OAuth for authentication and Stripe for payment
            processing. These services have their own privacy policies.
          </p>

          <h2 className="text-[16px] font-semibold text-text pt-2">
            Your Rights
          </h2>
          <p>
            You can update or delete your profile information at any time
            through the app. To request full account deletion, contact us at
            the email below.
          </p>

          <h2 className="text-[16px] font-semibold text-text pt-2">
            Contact
          </h2>
          <p>
            If you have questions about this privacy policy, contact us at{" "}
            <a
              href="mailto:keugenelee11@gmail.com"
              className="text-text underline underline-offset-2"
            >
              keugenelee11@gmail.com
            </a>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
