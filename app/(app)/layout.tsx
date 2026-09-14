export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="h-dvh w-full overflow-hidden">{children}</div>;
}
