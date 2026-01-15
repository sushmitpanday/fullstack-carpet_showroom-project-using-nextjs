import "./globals.css";

// "export default" likhna zaroori hai
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#1a1a2e] text-white overflow-x-hidden">
        {/* Layout ka content yahan load hoga */}
        {children}
      </body>
    </html>
  );
}