import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CourseScheduleItemDtoStatusEnum as StatusEnum } from '@client/api';
import { statusRenderer, renderStatusWithStyle, renderTagWithStyle } from './renderers';

describe('TableView renderers', () => {
  it('statusRenderer capitalizes the status into a badge label', () => {
    render(<div>{statusRenderer(StatusEnum.Missed)}</div>);
    expect(screen.getByText('Missed')).toBeInTheDocument();
  });

  it('renderStatusWithStyle renders a capitalized status tag', () => {
    render(<div>{renderStatusWithStyle(StatusEnum.Available)}</div>);
    expect(screen.getByText('Available')).toBeInTheDocument();
  });

  it('renderTagWithStyle uses the friendly TAG_NAME_MAP label for a known tag', () => {
    render(<div>{renderTagWithStyle('coding')}</div>);
    expect(screen.getByText('Coding')).toBeInTheDocument();
  });

  it('renderTagWithStyle falls back to the raw tag value for an unknown tag', () => {
    // `TAG_NAME_MAP[tagName] || tagName` → the raw value when the tag is not in the map.
    render(<div>{renderTagWithStyle('mystery-tag' as never)}</div>);
    expect(screen.getByText('mystery-tag')).toBeInTheDocument();
  });
});
