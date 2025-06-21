import type { Metadata } from "next";
import React, { Suspense } from "react";
import localFont from "next/font/local";
import { Toaster } from "components/ui/sonner"
import "./globals.css";
import Loading from "./Loading";
import { CustomProvider } from 'rsuite';
import GoogleMapsProvider from "providers/google/GoogleMapProvider";
import "../public/styles/main.css"
import "../public/css/column.css";
import "../public/css/InvoiceForm.css";
import '../lib/dayjs.config'
// import "suneditor/dist/css/suneditor.min.css";
import 'react-phone-input-2/lib/style.css'

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Silver Taxi",
  description: "Silver Taxi - A comprehensive platform for managing cab bookings, vendor interactions, and payment processing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          cz-shortcut-listen="true"
        >
          <CustomProvider>
            <Suspense fallback={<Loading />}>
              <GoogleMapsProvider>
                {children}
              </GoogleMapsProvider>
              <Toaster />
            </Suspense>
          </CustomProvider>
        </body>
      </html>
    </>
  );
}
