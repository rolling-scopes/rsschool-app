import * as React from 'react';
import { PropsWithChildren } from 'react';
import { TopMenu } from './TopMenu';

type Props = PropsWithChildren<{
  username: string;
  courseName?: string;
  title?: string;
  isProfilePage?: boolean;
  isProfileEditingModeEnabled?: boolean;
  isSaveButtonVisible?: boolean;
  onChangeProfilePageMode?: (mode: 'edit' | 'view') => void;
  onSaveClick?: () => void;
}>;

export function Header(props: Props) {
  return <TopMenu githubId={props.username} />;
}
