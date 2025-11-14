// Google Analytics 4 Event Tracking & Google Tag Manager Support

declare global {
  interface Window {
    gtag: (
      command: 'config' | 'set' | 'event',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void;
    dataLayer: any[];
  }
}

// Helper function to push events to both gtag and dataLayer (for GTM)
const pushToDataLayer = (eventData: any) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push(eventData);
  }
};

// Track page views
export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '', {
      page_path: url,
    });
  }
};

// Track product views
export const trackProductView = (product: {
  id: string;
  name: string;
  category: string;
  price: number;
  currency?: string;
}) => {
  const eventData = {
    event: 'view_item',
    currency: product.currency || 'INR',
    value: product.price,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        price: product.price,
        currency: product.currency || 'INR',
      },
    ],
  };

  // Push to dataLayer for GTM
  pushToDataLayer(eventData);

  // Also use gtag if available (for direct GA4)
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'view_item', eventData);
  }
};

// Track add to cart
export const trackAddToCart = (item: {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  currency?: string;
}) => {
  const eventData = {
    event: 'add_to_cart',
    currency: item.currency || 'INR',
    value: item.price * item.quantity,
    items: [
      {
        item_id: item.id,
        item_name: item.name,
        item_category: item.category,
        price: item.price,
        quantity: item.quantity,
        currency: item.currency || 'INR',
      },
    ],
  };

  // Push to dataLayer for GTM
  pushToDataLayer(eventData);

  // Also use gtag if available (for direct GA4)
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'add_to_cart', eventData);
  }
};

// Track remove from cart
export const trackRemoveFromCart = (item: {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  currency?: string;
}) => {
  const eventData = {
    event: 'remove_from_cart',
    currency: item.currency || 'INR',
    value: item.price * item.quantity,
    items: [
      {
        item_id: item.id,
        item_name: item.name,
        item_category: item.category,
        price: item.price,
        quantity: item.quantity,
        currency: item.currency || 'INR',
      },
    ],
  };

  // Push to dataLayer for GTM
  pushToDataLayer(eventData);

  // Also use gtag if available (for direct GA4)
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'remove_from_cart', eventData);
  }
};

// Track begin checkout
export const trackBeginCheckout = (items: Array<{
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  currency?: string;
}>) => {
  const totalValue = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  const eventData = {
    event: 'begin_checkout',
    currency: items[0]?.currency || 'INR',
    value: totalValue,
    items: items.map(item => ({
      item_id: item.id,
      item_name: item.name,
      item_category: item.category,
      price: item.price,
      quantity: item.quantity,
      currency: item.currency || 'INR',
    })),
  };

  // Push to dataLayer for GTM
  pushToDataLayer(eventData);

  // Also use gtag if available (for direct GA4)
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'begin_checkout', eventData);
  }
};

// Track purchase
export const trackPurchase = (transaction: {
  transaction_id: string;
  value: number;
  currency?: string;
  items: Array<{
    id: string;
    name: string;
    category: string;
    price: number;
    quantity: number;
  }>;
}) => {
  const eventData = {
    event: 'purchase',
    transaction_id: transaction.transaction_id,
    value: transaction.value,
    currency: transaction.currency || 'INR',
    items: transaction.items.map(item => ({
      item_id: item.id,
      item_name: item.name,
      item_category: item.category,
      price: item.price,
      quantity: item.quantity,
      currency: transaction.currency || 'INR',
    })),
  };

  // Push to dataLayer for GTM
  pushToDataLayer(eventData);

  // Also use gtag if available (for direct GA4)
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', eventData);
  }
};

// Track search
export const trackSearch = (searchTerm: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'search', {
      search_term: searchTerm,
    });
  }
};

// Track custom events
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  const eventData = {
    event: eventName,
    ...parameters,
  };

  // Push to dataLayer for GTM
  pushToDataLayer(eventData);

  // Also use gtag if available (for direct GA4)
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};

