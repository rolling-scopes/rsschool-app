/* eslint-disable testing-library/no-container, testing-library/no-node-access */
import { act, fireEvent, render, screen } from '@testing-library/react';
import { FilteredTags } from './FilteredTags';

describe('FilteredTags', () => {
  it('renders filter states and invokes tag actions', () => {
    vi.useFakeTimers();
    const onTagClose = vi.fn();
    const onClearAllButtonClick = vi.fn();
    const { container, rerender } = render(
      <FilteredTags tagFilters={[]} onTagClose={onTagClose} onClearAllButtonClick={onClearAllButtonClick} />,
    );

    expect(container).toBeEmptyDOMElement();
    rerender(
      <FilteredTags
        tagFilters={['react', 'node']}
        onTagClose={onTagClose}
        onClearAllButtonClick={onClearAllButtonClick}
      />,
    );

    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('node')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /clear all/i })).toBeInTheDocument();
    fireEvent.click(container.querySelector('.ant-tag-close-icon') as Element);
    act(() => vi.runOnlyPendingTimers());
    expect(onTagClose).toHaveBeenCalledWith('react');
    fireEvent.click(screen.getByRole('button', { name: /clear all/i }));
    expect(onClearAllButtonClick).toHaveBeenCalledTimes(1);

    rerender(
      <FilteredTags
        tagFilters={['js']}
        filterName="Skill: "
        tagNameMap={{ js: 'JavaScript' }}
        onTagClose={onTagClose}
        onClearAllButtonClick={onClearAllButtonClick}
      />,
    );

    expect(screen.getByText('Skill: JavaScript')).toBeInTheDocument();
    vi.useRealTimers();
  });
});
