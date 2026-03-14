import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "BizLead | B2B Lead Generation Software for Sales Teams in India",
  description: "Find verified B2B business leads across India in seconds. Filter by industry, location, and keywords. Export structured contact data instantly. Perfect for sales teams, recruiters, and marketers.",
  keywords: "B2B lead generation software, Business database India, Verified business leads, Sales prospecting tool, Lead generation SaaS India",
  icons: {
    icon: "/favicon.png?v=4",
    apple: "/favicon.png?v=4",
  },
  openGraph: {
    title: "BizLead | B2B Lead Generation Software for Sales Teams in India",
    description: "Find verified B2B business leads across India in seconds. Filter by industry, location, and keywords. Export structured contact data instantly.",
    type: "website",
    url: "https://app.infodratechnologies.com/bizlead",
    images: [
      {
        url: "/favicon.png?v=4",
        width: 200,
        height: 200,
        alt: "BizLead - AI-Powered B2B Lead Generation Platform",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "BizLead | B2B Lead Generation for Sales Teams",
    description: "Find verified business leads across India. Smart lead generation SaaS platform with advanced filtering and instant search.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="color-scheme" content="dark" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        {/* Razorpay Payment Gateway Script */}
        <script src="https://checkout.razorpay.com/v1/checkout.js" async />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "BizLead",
              "url": "https://app.infodratechnologies.com/bizlead",
              "logo": "https://app.infodratechnologies.com/bizlead-logo.png",
              "description": "B2B Lead Generation Software for Sales Teams in India",
              "parentOrganization": {
                "@type": "Organization",
                "name": "Infodra Technologies Private Limited"
              },
              "areaServed": "IN",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+91-81481-46785",
                "contactType": "Customer Service",
                "email": "business@infodratechnologies.com"
              }
            }),
          }}
        />
      </head>
      <body
        className={`${inter.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
