import { api } from '../../electron/bridge';

declare global {
  interface Window {
    api: typeof api
  }
};