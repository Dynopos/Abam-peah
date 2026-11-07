/* GET /api/config — beritahu borang sama ada bayaran dalam talian aktif */
import { config as bc, isConfigured, json } from '../lib/bayarcash.mjs';

export default async () => {
  const c = bc();
  return json({ enabled: isConfigured(c), mode: c.mode });
};
export const config = { path: '/api/config' };
