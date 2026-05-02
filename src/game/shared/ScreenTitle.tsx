import React from 'react';
import { useGameStore } from '@game/store';
import { getQuestById } from '../screens/QuestSelect/logic';
import { useTranslation } from '../../hooks/useTranslation';
import './ScreenTitle.css';

interface ScreenTitleProps {
  scene: string;
}

export const ScreenTitle: React.FC<ScreenTitleProps> = ({ scene }) => {
  const state = useGameStore((store) => store.state);
  const t = useTranslation();
  
  let title = 'Runeterrogue';
  
  switch (scene) {
    case 'quest':
      title = t.screenTitle.quest;
      break;
    case 'shop':
      title = t.screenTitle.shop;
      break;
    case 'battle':
    case 'testBattle':
      // Get the selected quest title if available
      if (state.selectedQuest) {
        const quest = getQuestById(state.selectedQuest.questId);
        title = quest?.name || t.screenTitle.battle;
      } else {
        title = t.screenTitle.battle;
      }
      break;
    case 'regionSelection':
      title = t.screenTitle.regionSelection;
      break;
    case 'pregame':
      title = t.screenTitle.pregame;
      break;
    case 'profiles':
      title = t.screenTitle.profiles;
      break;
    case 'index':
      title = t.screenTitle.index;
      break;
    case 'preTestSetup':
      title = t.screenTitle.preTestSetup;
      break;
    case 'postRegionAction':
      title = t.screenTitle.postRegionAction;
      break;
    case 'loading':
      title = t.common.loading;
      break;
    default:
      title = 'Runeterrogue';
  }
  
  return <h2 className="screen-title">{title}</h2>;
};
