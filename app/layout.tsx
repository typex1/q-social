import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Q-Social',
  description: 'A simple social micro-blogging application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
