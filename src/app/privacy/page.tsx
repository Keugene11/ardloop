export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-bg">
      <main className="max-w-md md:max-w-2xl mx-auto px-5 pt-8 pb-16">
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
            regarding the collection, use, disclosure, and protection of
            personal information when you use our service.
          </p>

          <h2 className="text-[16px] font-semibold text-text pt-2">
            Information We Collect
          </h2>
          <p>
            When you create an account via Google Sign-In, we receive and store
            your name, email address, and profile photo from your Google
            account. When you use the app, we collect the content you post,
            comments, likes, and messages you send.
          </p>

          <h2 className="text-[16px] font-semibold text-text pt-2">
            How We Use Your Information
          </h2>
          <p>
            We use your information solely to provide and improve the
            Ardsleypost service, including displaying your profile to other
            users, delivering messages, enabling payments, and maintaining app
            functionality. We do not use your data for advertising or marketing
            purposes.
          </p>

          <h2 className="text-[16px] font-semibold text-text pt-2">
            Data Sharing and Disclosure
          </h2>
          <p>
            We do not sell, trade, or rent your personal information to third
            parties. We share your data only with the following service
            providers who are necessary to operate the app:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <strong className="text-text">Google</strong> — for
              authentication (OAuth sign-in). Google receives your
              authentication token to verify your identity. See{" "}
              <a
                href="https://policies.google.com/privacy"
                className="text-text underline underline-offset-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google's Privacy Policy
              </a>
              .
            </li>
            <li>
              <strong className="text-text">Supabase</strong> — for database
              hosting and storage. Your data is stored on Supabase's
              infrastructure (hosted on AWS). See{" "}
              <a
                href="https://supabase.com/privacy"
                className="text-text underline underline-offset-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                Supabase's Privacy Policy
              </a>
              .
            </li>
            <li>
              <strong className="text-text">Stripe</strong> — for payment
              processing. If you make or receive payments, Stripe processes your
              payment information. See{" "}
              <a
                href="https://stripe.com/privacy"
                className="text-text underline underline-offset-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                Stripe's Privacy Policy
              </a>
              .
            </li>
          </ul>
          <p>
            Beyond these service providers, we do not share, transfer, or
            disclose your Google user data or any other personal information to
            any other third parties.
          </p>

          <h2 className="text-[16px] font-semibold text-text pt-2">
            Data Protection and Security
          </h2>
          <p>
            We implement industry-standard security measures to protect your
            personal information:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              All data transmitted between your device and our servers is
              encrypted using TLS/SSL (HTTPS).
            </li>
            <li>
              Your data is stored in encrypted databases managed by Supabase,
              which uses AES-256 encryption at rest.
            </li>
            <li>
              Authentication tokens and session data are handled securely using
              industry-standard protocols (OAuth 2.0).
            </li>
            <li>
              Access to user data is restricted to authorized personnel only and
              is limited to what is necessary to operate and maintain the
              service.
            </li>
            <li>
              Passwords and sensitive credentials are never stored in plaintext.
            </li>
          </ul>

          <h2 className="text-[16px] font-semibold text-text pt-2">
            Data Retention
          </h2>
          <p>
            We retain your personal data for as long as your account is active.
            When you request account deletion, all associated data is
            permanently removed within 30 days. We do not retain copies of
            deleted data.
          </p>

          <h2 className="text-[16px] font-semibold text-text pt-2">
            Your Rights
          </h2>
          <p>You have the right to:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Access the personal data we hold about you</li>
            <li>
              Update or correct your profile information at any time through the
              app
            </li>
            <li>
              Request deletion of your account and all associated data by
              visiting{" "}
              <a
                href="/delete-account"
                className="text-text underline underline-offset-2"
              >
                our account deletion page
              </a>
            </li>
            <li>Revoke Google sign-in access through your Google account settings</li>
          </ul>

          <h2 className="text-[16px] font-semibold text-text pt-2">
            Children's Privacy
          </h2>
          <p>
            Ardsleypost is not directed at children under the age of 13. We do
            not knowingly collect personal information from children under 13.
            If we become aware that we have collected data from a child under
            13, we will take steps to delete that information promptly.
          </p>

          <h2 className="text-[16px] font-semibold text-text pt-2">
            Changes to This Policy
          </h2>
          <p>
            We may update this privacy policy from time to time. We will notify
            users of any material changes by posting the new policy on this
            page with an updated revision date.
          </p>

          <h2 className="text-[16px] font-semibold text-text pt-2">
            Contact
          </h2>
          <p>
            If you have questions about this privacy policy or our data
            practices, contact us at{" "}
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
