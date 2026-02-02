import { Translations } from '../../types';
import { common } from './common';
import { ui } from './ui';
import { items } from './items';
import { weapons } from './weapons';
import { spells } from './spells';
import { enemies } from './enemies';
import { passives } from './passives';
import { abilities } from './abilities';
import { statusEffects } from './statusEffects';

export const en: Translations = {
  common,
  ...ui,
  items,
  enemies,
  weapons,
  spells,
  passives,
  abilities,
  statusEffects,
};
