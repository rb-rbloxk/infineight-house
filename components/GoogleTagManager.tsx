'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

declare global {
  interface Window {
    dataLayer: any[];
  }
}

export function GoogleTagManager() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

  useEffect(() => {
    if (GTM_ID && typeof window !== 'undefined' && window.dataLayer) {
      // Push page view to dataLayer for GTM
      window.dataLayer.push({
        event: 'page_view',
        page_path: pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : ''),
        page_title: typeof document !== 'undefined' ? document.title : '',
      });
    }
  }, [pathname, searchParams, GTM_ID]);

  if (!GTM_ID) {
    return null;
  }

  return (
    <>
      {/* Google Tag Manager - Script in head */}
      <Script
        id="google-tag-manager"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${GTM_ID}');
          `,
        }}
      />
      {/* Google Tag Manager (noscript) - Must be immediately after opening <body> tag */}
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
          title="Google Tag Manager"
        />
      </noscript>
    </>
  );
}

