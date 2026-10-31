import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { loadAdaptiveSettings } from './adaptiveSettings';

const id = 29001;
let revision = 0;
let queue: Promise<unknown> = Promise.resolve();

/** Serialize native operations so a late permission response cannot restore a cancelled alarm. */
export function scheduleRestNotification(at: number, title: string, body: string): Promise<boolean> {
  const request = ++revision;
  const result = queue.then(async () => {
    if (!Capacitor.isNativePlatform() || request !== revision) return false;
    await LocalNotifications.cancel({ notifications: [{ id }] });
    let permission = await LocalNotifications.checkPermissions();
    if (permission.display === 'prompt' || permission.display === 'prompt-with-rationale') {
      permission = await LocalNotifications.requestPermissions();
    }
    if (permission.display !== 'granted' || request !== revision || at <= Date.now()) return false;
    const settings = loadAdaptiveSettings();
    const channelId = `rest-complete-s${Number(settings.sound)}-v${Number(settings.vibration)}`;
    if (Capacitor.getPlatform() === 'android') {
      await LocalNotifications.createChannel({ id: channelId, name: title, importance: 5,
        vibration: settings.vibration, sound: settings.sound ? 'rest_complete.wav' : 'rest_silent.wav' });
    }
    if (request !== revision || at <= Date.now()) return false;
    await LocalNotifications.schedule({ notifications: [{ id, title, body,
      channelId, ...(settings.sound ? { sound: 'default' } : {}),
      schedule: { at: new Date(at), allowWhileIdle: true },
    }] });
    return request === revision;
  }).catch(() => false);
  queue = result;
  return result;
}

export function cancelRestNotification() {
  ++revision;
  queue = queue.then(async () => {
    if (Capacitor.isNativePlatform()) await LocalNotifications.cancel({ notifications: [{ id }] });
  }).catch(() => {});
}
