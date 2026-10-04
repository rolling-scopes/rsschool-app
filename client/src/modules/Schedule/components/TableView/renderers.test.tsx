import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CourseScheduleItemDtoStatusEnum as StatusEnum } from '@client/api';
import { statusRenderer, renderStatusWithStyle, renderTagWithStyle } from './renderers';

vi.mock('antd', () => ({
  Badge: ({ text }: { text: React.ReactNode }) => <span>{text}</span>,
  Tag: ({ children }: React.PropsWithChildren) => <span>{children}</span>,
}));

describe('TableView renderers', () => {
  it('renders status and known and unknown tag labels', () => {
    render(
      <div>
        {statusRenderer(StatusEnum.Missed)}
        {renderStatusWithStyle(StatusEnum.Available)}
        {renderTagWithStyle('coding')}
        {renderTagWithStyle('mystery-tag' as never)}
      </div>,
    );

    expect(screen.getByText('Missed')).toBeInTheDocument();
    expect(screen.getByText('Available')).toBeInTheDocument();
    expect(screen.getByText('Coding')).toBeInTheDocument();
    expect(screen.getByText('mystery-tag')).toBeInTheDocument();
  });
});
