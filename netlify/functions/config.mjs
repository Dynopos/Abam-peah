/* GET /api/config — beritahu borang sama ada bayaran dalam talian (CHIP) aktif */
import { config as chip, isConfigured } from '../lib/chip.mjs';
import { json } from '../lib/common.mjs';

export default async () => {
  const c = chip();
  return json({ enabled: isConfigured(c), mode: c.mode, gateway: 'chip' });
};
export const config = { path: '/api/config' };
