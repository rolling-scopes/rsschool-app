'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

const enableAnalytics = process.env.NODE_ENV === 'production';

export function Analytics() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!enableAnalytics) {
    return null;
  }

  if (!hasMounted) {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=G-WJLHZ9CCXJ"
      />

      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-WJLHZ9CCXJ');
        `}
      </Script>

      <Script
        strategy="lazyOnload"
        src="https://static.cloudflareinsights.com/beacon.min.js"
        data-cf-beacon={'{"token": "e607238d732c4713b01b851ed3df61c2"}'}
      />
    </>
  );
}
