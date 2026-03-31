export default function DeleteAccount() {
  return (
    <div className="min-h-screen bg-bg">
      <main className="max-w-md md:max-w-2xl mx-auto px-5 pt-8 pb-16">
        <h1 className="text-[24px] font-extrabold tracking-tight mb-6">
          Delete Your Account
        </h1>
        <div className="text-[14px] leading-relaxed text-text-muted space-y-4">
          <p>
            We're sorry to see you go. To request deletion of your Ardsleypost
            account and all associated data, please follow the steps below.
          </p>

          <h2 className="text-[16px] font-semibold text-text pt-2">
            How to Request Account Deletion
          </h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>
              Send an email to{" "}
              <a
                href="mailto:keugenelee11@gmail.com?subject=Delete%20My%20Ardsleypost%20Account"
                className="text-text underline underline-offset-2"
              >
                keugenelee11@gmail.com
              </a>{" "}
              with the subject line "Delete My Ardsleypost Account"
            </li>
            <li>
              Include the email address associated with your account
            </li>
            <li>
              We will process your request within 30 days
            </li>
          </ol>

          <h2 className="text-[16px] font-semibold text-text pt-2">
            What Data Is Deleted
          </h2>
          <p>When your account is deleted, the following data is permanently removed:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Your profile information (name, email, avatar, bio)</li>
            <li>All posts you have created</li>
            <li>All comments you have made</li>
            <li>All direct messages</li>
            <li>All likes and interactions</li>
            <li>Payment and transaction history</li>
          </ul>

          <h2 className="text-[16px] font-semibold text-text pt-2">
            Data Retention
          </h2>
          <p>
            All user data is deleted immediately upon processing your request.
            No data is retained after account deletion. Deletion is permanent
            and cannot be undone.
          </p>
        </div>
      </main>
    </div>
  );
}
