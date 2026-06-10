import { useEffect } from 'react';
import { subscribeToPush } from '../api/notificationApi';
import { urlBase64ToUint8Array, arrayBufferToBase64 } from '../utils/pushHelpers';

export function usePushNotifications() {
  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return;

    const registerAndSubscribe = async () => {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return;

      const registration = await navigator.serviceWorker.ready;
      const applicationServerKey = urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY);

      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        });
      }

      await subscribeToPush({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
          auth: arrayBufferToBase64(subscription.getKey('auth')),
        },
      });
    };

    registerAndSubscribe().catch(console.error);
  }, []);
}