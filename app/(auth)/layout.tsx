export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-background px-4 py-12">
      {children}
    </div>
  );
}
