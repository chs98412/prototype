import { Ionicons } from '@expo/vector-icons';

type IconProps = {
  size?: number;
  color?: string;
};

export const HomeIcon = ({ size = 24, color = '#1f1f1f' }: IconProps) => (
  <Ionicons name="home-outline" size={size} color={color} />
);

export const HomeFilledIcon = ({ size = 24, color = '#1f1f1f' }: IconProps) => (
  <Ionicons name="home" size={size} color={color} />
);

export const SearchIcon = ({ size = 24, color = '#1f1f1f' }: IconProps) => (
  <Ionicons name="search" size={size} color={color} />
);

export const BellIcon = ({ size = 24, color = '#1f1f1f' }: IconProps) => (
  <Ionicons name="notifications-outline" size={size} color={color} />
);

export const BellFilledIcon = ({ size = 24, color = '#1f1f1f' }: IconProps) => (
  <Ionicons name="notifications" size={size} color={color} />
);

export const PersonIcon = ({ size = 24, color = '#1f1f1f' }: IconProps) => (
  <Ionicons name="person-outline" size={size} color={color} />
);

export const HeartIcon = ({ size = 18, color = '#1f1f1f', filled = false }: IconProps & { filled?: boolean }) => (
  <Ionicons name={filled ? 'heart' : 'heart-outline'} size={size} color={color} />
);

export const CommentIcon = ({ size = 18, color = '#1f1f1f' }: IconProps) => (
  <Ionicons name="chatbubble-outline" size={size} color={color} />
);

export const BookmarkIcon = ({ size = 18, color = '#1f1f1f', filled = false }: IconProps & { filled?: boolean }) => (
  <Ionicons name={filled ? 'bookmark' : 'bookmark-outline'} size={size} color={color} />
);

export const BackIcon = ({ size = 24, color = '#1f1f1f' }: IconProps) => (
  <Ionicons name="chevron-back" size={size} color={color} />
);

export const PlusIcon = ({ size = 24, color = '#1f1f1f' }: IconProps) => (
  <Ionicons name="add" size={size} color={color} />
);

export const PencilIcon = ({ size = 18, color = '#1f1f1f' }: IconProps) => (
  <Ionicons name="pencil-outline" size={size} color={color} />
);

export const EllipsisIcon = ({ size = 18, color = '#1f1f1f' }: IconProps) => (
  <Ionicons name="ellipsis-horizontal" size={size} color={color} />
);

export const StarIcon = ({ size = 14, color = '#1f1f1f', filled = false }: IconProps & { filled?: boolean }) => (
  <Ionicons name={filled ? 'star' : 'star-outline'} size={size} color={color} />
);

export const CameraIcon = ({ size = 20, color = '#1f1f1f' }: IconProps) => (
  <Ionicons name="camera-outline" size={size} color={color} />
);

export const SparkleIcon = ({ size = 14, color = '#1f1f1f' }: IconProps) => (
  <Ionicons name="sparkles-outline" size={size} color={color} />
);
