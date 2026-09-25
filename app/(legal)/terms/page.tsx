import type { Metadata } from "next";
import Link from "next/link";

import {
  APP_NAME,
  LEGAL_CONTACT_EMAIL,
  LEGAL_LAST_UPDATED,
} from "@/lib/constants/legal";

export const metadata: Metadata = {
  title: `Terms of Service — ${APP_NAME}`,
  description: `The terms for using ${APP_NAME}.`,
};

export default function TermsPage() {
  return (
    <>
      <h1>Terms of Service</h1>
      <p className="text-muted-foreground">Last updated: {LEGAL_LAST_UPDATED}</p>

      <p>
        By creating an account or using {APP_NAME}, you agree to these terms.
        If you do not agree, please do not use the app.
      </p>

      <h2>Your account</h2>
      <p>
        You are responsible for keeping your login details secure and for
        activity under your account. Provide an accurate email address so we
        can reach you about your account.
      </p>

      <h2>Your content</h2>
      <p>
        You own the places, notes and photos you add. You give us permission to
        store and display them as needed to run the app, including on your
        public page if you choose to publish it. Only upload content you have
        the right to share.
      </p>

      <h2>Acceptable use</h2>
      <ul>
        <li>Do not upload illegal, hateful, harassing or infringing content.</li>
        <li>Do not attempt to break, overload or gain unauthorised access to the service.</li>
        <li>Do not use the service to spam or impersonate others.</li>
      </ul>
      <p>
        We may remove content or suspend accounts that break these rules.
      </p>

      <h2>Availability and changes</h2>
      <p>
        {APP_NAME} is provided &quot;as is&quot;, without warranties. We may
        change, pause or discontinue features at any time, and we do not
        guarantee the service will always be available or error-free. Keep your
        own copy of anything important.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the extent permitted by law, we are not liable for indirect or
        consequential losses arising from your use of the app, including loss
        of data.
      </p>

      <h2>Ending your account</h2>
      <p>
        You can stop using {APP_NAME} at any time. To delete your account and
        data, email{" "}
        <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>.
      </p>

      <h2>Privacy</h2>
      <p>
        How we handle your data is described in our{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <h2>Changes to these terms</h2>
      <p>
        We may update these terms. Continuing to use the app after a change
        means you accept the updated terms.
      </p>

      <h2>Contact</h2>
      <p>
        Questions? Email{" "}
        <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>.
      </p>
    </>
  );
}
