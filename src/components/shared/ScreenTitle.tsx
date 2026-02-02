import React from 'react';
import { useGameStore } from '../../game/store';
import { getQuestById } from '../../game/questDatabase';
import './ScreenTitle.css';

interface ScreenTitleProps {
  scene: string;
}

export const ScreenTitle: React.FC<ScreenTitleProps> = ({ scene }) => {
  const state = useGameStore((store) => store.state);
  
  let title = 'Runeterrogue';
  
  switch (scene) {
    case 'quest':
      title = 'Quest Selection';
      break;
    case 'shop':
      title = 'Shop';
      break;
    case 'battle':
    case 'testBattle':
      // Get the selected quest title if available
      if (state.selectedQuest) {
        const quest = getQuestById(state.selectedQuest.questId);
        title = quest?.name || 'Battle';
      } else {
        title = 'Battle';
      }
      break;
    case 'regionSelection':
      title = 'Region Selection';
      break;
    case 'pregame':
      title = 'Character Setup';
      break;
    case 'profiles':
      title = 'Profiles';
      break;
    case 'index':
      title = 'Index';
      break;
    case 'preTestSetup':
      title = 'Test Setup';
      break;
    case 'postRegionAction':
      title = 'Next Step';
      break;
    case 'loading':
      title = 'Loading...';
      break;
    default:
      title = 'Runeterrogue';
  }
  
  return <h2 className="screen-title">{title}</h2>;
};
