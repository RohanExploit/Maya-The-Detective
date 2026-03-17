import './globals.css';

export const metadata = {
  title: 'DeepShield AI — Deepfake Detector',
  description:
    'Upload an image or audio clip to detect deepfakes in seconds. Powered by HuggingFace AI models with multi-tier fallback.',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
