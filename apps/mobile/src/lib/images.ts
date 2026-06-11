import { ImageSourcePropType } from 'react-native';

const posterYuhi = require('../../assets/images/poster-yuhi.png') as ImageSourcePropType;
const posterRachel = require('../../assets/images/poster-rachel.png') as ImageSourcePropType;
const posterFeed = require('../../assets/images/poster-feed.png') as ImageSourcePropType;
const posterMonster = require('../../assets/images/poster-monster.png') as ImageSourcePropType;
const posterExtra1 = require('../../assets/images/poster-extra1.png') as ImageSourcePropType;
const posterExtra2 = require('../../assets/images/poster-extra2.png') as ImageSourcePropType;
const posterExtra3 = require('../../assets/images/poster-extra3.png') as ImageSourcePropType;
const posterExtra4 = require('../../assets/images/poster-extra4.png') as ImageSourcePropType;
const bgMonster = require('../../assets/images/bg-monster.png') as ImageSourcePropType;
const essayInline = require('../../assets/images/essay-inline.png') as ImageSourcePropType;
const profileImg = require('../../assets/images/profile.jpg') as ImageSourcePropType;

export const Images: Record<string, ImageSourcePropType> = {
  posterYuhi,
  posterRachel,
  posterFeed,
  posterMonster,
  posterExtra1,
  posterExtra2,
  posterExtra3,
  posterExtra4,
  bgMonster,
  essayInline,
  profile: profileImg,
};
