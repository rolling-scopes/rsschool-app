import { render, screen } from '@testing-library/react';
import { List } from './index';

describe('List', () => {
  it('renders Empty state when dataSource is an empty array', () => {
    render(<List dataSource={[]} renderItem={item => <span>{String(item)}</span>} />);

    expect(screen.getByText('No data', { selector: 'div' })).toBeInTheDocument();
  });

  it('renders items when dataSource has elements', () => {
    const data = ['Rumor', 'Tumor', 'Functio laesa'];

    render(<List dataSource={data} renderItem={item => <span>{item}</span>} />);

    expect(screen.getByText('Rumor')).toBeInTheDocument();
    expect(screen.getByText('Tumor')).toBeInTheDocument();
    expect(screen.getByText('Functio laesa')).toBeInTheDocument();
  });

  it('assigns data-testid to each list item based on index', () => {
    const data = ['A', 'B'];

    render(<List dataSource={data} renderItem={item => <span>{item}</span>} />);

    expect(screen.getByTestId('list-item-0')).toBeInTheDocument();
    expect(screen.getByTestId('list-item-1')).toBeInTheDocument();
  });

  it('renders header when provided', () => {
    render(<List dataSource={['item']} renderItem={item => <span>{item}</span>} header={<span>My Header</span>} />);

    expect(screen.getByText('My Header')).toBeInTheDocument();
  });

  it('does not render header section when not provided', () => {
    render(<List dataSource={['item']} renderItem={item => <span>{item}</span>} />);

    expect(screen.queryByText('My Header')).not.toBeInTheDocument();
  });

  it('calls renderItem with item and index', () => {
    const renderItem = vi.fn((item: string, index: number) => <span>{`${index}:${item}`}</span>);

    render(<List dataSource={['X']} renderItem={renderItem} />);

    expect(renderItem).toHaveBeenCalledWith('X', 0);
  });

  it('uses function rowKey to generate keys', () => {
    const data = [{ id: 10, label: 'Foo' }];
    const rowKey = (item: { id: number }) => String(item.id);

    render(<List dataSource={data} renderItem={item => <span>{item.label}</span>} rowKey={rowKey} />);

    expect(screen.getByText('Foo')).toBeInTheDocument();
  });

  it('uses string rowKey to generate keys', () => {
    const data = [{ id: 10, label: 'Bar' }];

    render(<List dataSource={data} renderItem={item => <span>{item.label}</span>} rowKey="id" />);

    expect(screen.getByText('Bar')).toBeInTheDocument();
  });
});
