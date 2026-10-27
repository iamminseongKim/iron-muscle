import { CapacitorHttp, registerPlugin } from '@capacitor/core';

export const RELEASE_API = 'https://api.github.com/repos/iamminseongKim/iron-muscle/releases/latest';
const ASSET_PREFIX = 'https://github.com/iamminseongKim/iron-muscle/releases/download/';
export interface AppRelease { version: string; notes: string; apkUrl?: string }
export const AppUpdater = registerPlugin<{ openInBrowser(options: { url: string }): Promise<void> }>('AppUpdater');

export function isNewerVersion(candidate: string, current: string): boolean {
  const parse = (v: string) => /^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.exec(v)?.slice(1).map(Number);
  const a = parse(candidate), b = parse(current);
  if (!a || !b) return false;
  for (let i = 0; i < 3; i++) { if (a[i] !== b[i]) return a[i] > b[i]; }
  return false;
}

export function parseRelease(data: any): AppRelease {
  if (!data || data.draft || data.prerelease || !/^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(data.tag_name)) throw new Error('Invalid release');
  const apk = Array.isArray(data.assets) ? data.assets.find((asset: any) =>
    asset.state === 'uploaded' && asset.name === `IronMuscle-${data.tag_name}.apk` &&
    asset.browser_download_url === `${ASSET_PREFIX}${data.tag_name}/${asset.name}`) : undefined;
  return { version: data.tag_name.replace(/^v/, ''), notes: typeof data.body === 'string' ? data.body : '', apkUrl: apk?.browser_download_url };
}

export async function checkLatestRelease(): Promise<AppRelease> {
  const response = await CapacitorHttp.get({ url: RELEASE_API, headers: { Accept: 'application/vnd.github+json' }, connectTimeout: 15000, readTimeout: 15000, responseType: 'json' });
  if (response.status !== 200) throw new Error(`Release HTTP ${response.status}`);
  return parseRelease(response.data);
}
