import './globals.css';

export const metadata = {
  title: 'Restaurant Management',
  description: 'Real-time restaurant management system',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}