import { render, screen } from '@testing-library/react';
import { DataTextValue } from './index';

const MockContent = () => <div>Mock content</div>;

describe('DataTextValue', () => {
    test('should display content', () => {
        render(
            <DataTextValue>
                <MockContent />
            </DataTextValue>
        );
        const mockContent = screen.getByText(/mock content/i);
        expect(mockContent).toBeInTheDocument();
    });
});