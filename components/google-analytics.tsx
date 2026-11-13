import Script from "next/script";

// Google Analytics 4. Loads only when GA_MEASUREMENT_ID (e.g. G-XXXXXXXXXX) is set in
// Vercel, so nothing is sent until the author turns it on. This is a server component,
// so a plain (non NEXT_PUBLIC_) variable works; the old name is still accepted.
export function GoogleAnalytics() {
  const id = (process.env.GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "").trim();
  if (!id || !/^G-[A-Z0-9]+$/.test(id)) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${id}', { anonymize_ip: true });`}
      </Script>
    </>
  );
}
