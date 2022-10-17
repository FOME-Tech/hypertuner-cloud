import { fetchEnv } from './env';

export const buildFullUrl = (parts = [] as string[]) => `${fetchEnv('VITE_WEB_URL')}/#${parts.join('/')}`;

export const buildRedirectUrl = (redirectPage: string, params: { [param: string]: string }) => {
  const url = new URL(fetchEnv('VITE_WEB_URL'));
  url.search = new URLSearchParams({
    redirect: redirectPage,
    ...params,
  }).toString();

  return url.toString();
};
