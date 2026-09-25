import { Suspense } from "react";

import { LoginForm } from "./login-form";
import { ShowcasePanel } from "./showcase-panel";

export default function LoginPage() {
  return (
    <div className="grid w-full max-w-5xl gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
      <ShowcasePanel />
    </div>
  );
}
