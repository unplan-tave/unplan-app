import { Header } from './Header';
import { type HeaderHomeProps } from './header.types';

export function HeaderHome({ greeting, title = 'Unplan', subtitle, ...props }: HeaderHomeProps) {
  return <Header title={title} subtitle={subtitle ?? greeting} {...props} />;
}
