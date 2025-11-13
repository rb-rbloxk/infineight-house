// Google Analytics 4 Event Tracking

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
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'view_item', {
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
    });
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
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'add_to_cart', {
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
    });
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
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'remove_from_cart', {
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
    });
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
  if (typeof window !== 'undefined' && window.gtag) {
    const totalValue = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    window.gtag('event', 'begin_checkout', {
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
    });
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
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
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
    });
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
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};

