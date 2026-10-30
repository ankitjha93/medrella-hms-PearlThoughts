'use client';

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayCheckoutOptions {
  key: string;
  amount: number; // in subunits (paise / cents)
  currency: string;
  name: string;
  description?: string;
  image?: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

export type RazorpayCheckoutResult =
  | { status: 'SUCCESS'; data: RazorpaySuccessResponse }
  | { status: 'DISMISSED' }
  | { status: 'UNAVAILABLE' };

/**
 * Dynamically injects the official Razorpay Checkout SDK (checkout.js)
 */
export function loadRazorpayCheckoutScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      return resolve(false);
    }

    if ((window as any).Razorpay) {
      return resolve(true);
    }

    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('Failed to load Razorpay Checkout script (e.g. adblocker or offline).');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

/**
 * Launches the native Razorpay Checkout popup modal and resolves with the payment credentials
 */
export async function openRazorpayCheckout(
  options: RazorpayCheckoutOptions
): Promise<RazorpayCheckoutResult> {
  const isLoaded = await loadRazorpayCheckoutScript();

  return new Promise((resolve) => {
    if (!isLoaded || !(window as any).Razorpay) {
      console.warn('Razorpay SDK unavailable. Proceeding with simulated fallback.');
      resolve({ status: 'UNAVAILABLE' });
      return;
    }

    try {
      let isCompleted = false;

      const rzpOptions = {
        ...options,
        handler: function (response: RazorpaySuccessResponse) {
          isCompleted = true;
          resolve({ status: 'SUCCESS', data: response });
        },
        modal: {
          ondismiss: function () {
            if (!isCompleted) {
              if (options.modal?.ondismiss) {
                options.modal.ondismiss();
              }
              resolve({ status: 'DISMISSED' });
            }
          },
        },
      };

      const razorpayInstance = new (window as any).Razorpay(rzpOptions);
      razorpayInstance.on('payment.failed', function (resp: any) {
        console.error('Razorpay payment failed:', resp.error);
      });
      razorpayInstance.open();
    } catch (err) {
      console.error('Error opening Razorpay instance:', err);
      resolve({ status: 'UNAVAILABLE' });
    }
  });
}
