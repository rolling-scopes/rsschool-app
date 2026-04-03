import { List as ListBase } from './List';
import { ListItem as ListItemBase } from './ListItem';
import { ListItemMeta } from './ListItemMeta';

export type { ListProps } from './List';
export type { ListItemProps } from './ListItem';
export type { ListItemMetaProps } from './ListItemMeta';

const ListItem = Object.assign(ListItemBase, { Meta: ListItemMeta });
export const List = Object.assign(ListBase, { Item: ListItem });
