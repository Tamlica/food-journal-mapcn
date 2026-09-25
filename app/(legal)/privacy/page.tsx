import type { Metadata } from "next";

import {
  APP_NAME,
  LEGAL_CONTACT_EMAIL,
  LEGAL_LAST_UPDATED,
} from "@/lib/constants/legal";

export const metadata: Metadata = {
  title: `Privacy Policy — ${APP_NAME}`,
  description: `How ${APP_NAME} collects, uses and protects your data.`,
};

export default function PrivacyPage() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <p className="text-muted-foreground">Last updated: {LEGAL_LAST_UPDATED}</p>

      <p>
        {APP_NAME} is a personal food journal that lets you pin places on a
        map. This policy explains what data we collect and how we use it.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>
          <strong>Account information:</strong> your email address and, if you
          create a password, a securely hashed version of it. If you sign in
          with Google, we receive your Google account email address and
          profile name from Google. We do not receive your Google password.
        </li>
        <li>
          <strong>Content you add:</strong> places, their locations, notes,
          ratings, prices, visit dates, tags and photos you upload.
        </li>
        <li>
          <strong>Public profile details:</strong> your username, and
          optionally a display name and short bio.
        </li>
      </ul>

      <h2>How we use your information</h2>
      <ul>
        <li>To provide the app: sign you in, store and show your journal.</li>
        <li>
          To send account emails, such as email confirmation and password
          reset.
        </li>
        <li>To keep the service secure and prevent abuse.</li>
      </ul>
      <p>We do not sell your data or use it for advertising.</p>

      <h2>What is public</h2>
      <p>
        Your journal is private by default. If you turn on your public page,
        only the places you mark as public are shown at{" "}
        <code>/u/your-username</code>, together with your username, display
        name and bio. Your notes are never shown on the public page.
      </p>

      <h2>Google sign-in</h2>
      <p>
        {APP_NAME}&apos;s use of information received from Google follows the{" "}
        <a
          href="https://developers.google.com/terms/api-services-user-data-policy"
          target="_blank"
          rel="noopener noreferrer"
        >
          Google API Services User Data Policy
        </a>
        , including the Limited Use requirements. We only use your Google email
        and name to create and identify your account. You can unlink Google
        from your account at any time in Profile, as long as you have set a
        password.
      </p>

      <h2>Where your data is stored</h2>
      <p>
        Your data is stored with our infrastructure provider, Supabase
        (database, authentication and image storage). Place searches and
        address lookups may be sent to OpenStreetMap Nominatim, and map tiles
        are loaded from a third-party map tile provider, which will see your
        IP address as part of normal web requests.
      </p>

      <h2>Cookies</h2>
      <p>
        We use cookies only to keep you signed in. We do not use advertising
        or tracking cookies.
      </p>

      <h2>Retention and deletion</h2>
      <p>
        We keep your data while your account exists. To delete your account
        and all associated data, email us at{" "}
        <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a> and
        we will remove it.
      </p>

      <h2>Children</h2>
      <p>
        {APP_NAME} is not intended for children under 13, and we do not
        knowingly collect their data.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this policy from time to time. The date at the top shows
        when it last changed.
      </p>

      <h2>Contact</h2>
      <p>
        Questions? Email{" "}
        <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>{LEGAL_CONTACT_EMAIL}</a>.
      </p>
    </>
  );
}
