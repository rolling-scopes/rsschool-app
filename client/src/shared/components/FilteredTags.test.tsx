/* eslint-disable testing-library/no-container, testing-library/no-node-access */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilteredTags } from './FilteredTags';

describe('FilteredTags', () => {
  it('renders nothing when there are no active tag filters', () => {
    const { container } = render(<FilteredTags tagFilters={[]} onTagClose={vi.fn()} onClearAllButtonClick={vi.fn()} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders a tag for each active filter', () => {
    render(<FilteredTags tagFilters={['react', 'node']} onTagClose={vi.fn()} onClearAllButtonClick={vi.fn()} />);

    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('node')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /clear all/i })).toBeInTheDocument();
  });

  it('prefixes tags with filterName and maps display names via tagNameMap', () => {
    render(
      <FilteredTags
        tagFilters={['js']}
        filterName="Skill: "
        tagNameMap={{ js: 'JavaScript' }}
        onTagClose={vi.fn()}
        onClearAllButtonClick={vi.fn()}
      />,
    );

    expect(screen.getByText('Skill: JavaScript')).toBeInTheDocument();
  });

  it('calls onTagClose with the tag when a tag is dismissed', async () => {
    const user = userEvent.setup();
    const onTagClose = vi.fn();
    const { container } = render(
      <FilteredTags tagFilters={['react']} onTagClose={onTagClose} onClearAllButtonClick={vi.fn()} />,
    );

    const closeIcon = container.querySelector('.ant-tag-close-icon');
    expect(closeIcon).toBeInTheDocument();
    await user.click(closeIcon as Element);

    expect(onTagClose).toHaveBeenCalledWith('react');
  });

  it('calls onClearAllButtonClick when the clear all button is clicked', async () => {
    const user = userEvent.setup();
    const onClearAllButtonClick = vi.fn();
    render(<FilteredTags tagFilters={['react']} onTagClose={vi.fn()} onClearAllButtonClick={onClearAllButtonClick} />);

    await user.click(screen.getByRole('button', { name: /clear all/i }));

    expect(onClearAllButtonClick).toHaveBeenCalledTimes(1);
  });
});
