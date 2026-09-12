import { render, screen } from '@testing-library/react';
import { List } from './index';

describe('List', () => {
  it('renders empty, populated, header, render callback, and row-key variants', () => {
    const { rerender } = render(<List dataSource={[]} renderItem={item => <span>{String(item)}</span>} />);

    expect(screen.getByText('No data', { selector: 'div' })).toBeInTheDocument();

    const data = ['Rumor', 'Tumor', 'Functio laesa'];
    const renderItem = vi.fn((item: string, index: number) => <span>{`${index}:${item}`}</span>);

    rerender(<List dataSource={data} renderItem={renderItem} />);

    expect(screen.getByText('0:Rumor')).toBeInTheDocument();
    expect(screen.getByText('1:Tumor')).toBeInTheDocument();
    expect(screen.getByText('2:Functio laesa')).toBeInTheDocument();
    expect(screen.getByTestId('list-item-0')).toBeInTheDocument();
    expect(screen.getByTestId('list-item-1')).toBeInTheDocument();
    expect(screen.queryByText('My Header')).not.toBeInTheDocument();
    expect(renderItem).toHaveBeenCalledWith('Rumor', 0);

    const rowKey = (item: { id: number }) => String(item.id);
    rerender(
      <List
        dataSource={[{ id: 10, label: 'Foo' }]}
        renderItem={item => <span>{item.label}</span>}
        rowKey={rowKey}
        header={<span>My Header</span>}
      />,
    );

    expect(screen.getByText('Foo')).toBeInTheDocument();
    expect(screen.getByText('My Header')).toBeInTheDocument();

    rerender(
      <List dataSource={[{ id: 10, label: 'Bar' }]} renderItem={item => <span>{item.label}</span>} rowKey="id" />,
    );

    expect(screen.getByText('Bar')).toBeInTheDocument();
  });
});
