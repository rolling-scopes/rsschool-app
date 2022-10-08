import { render, screen } from '@testing-library/react';
import { EditViewCv, ResumeProps } from './index';

const enum CvComponents {
  NoConsentView,
  EditCV,
  ViewCV,
}

jest.mock('../NoConsentView', () => ({
  NoConsentView: () => <div>{CvComponents.NoConsentView}</div>,
}));

jest.mock('../EditCv', () => ({
  EditCV: () => <div>{CvComponents.EditCV}</div>,
}));

jest.mock('../ViewCv', () => ({
  ViewCV: () => <div>{CvComponents.ViewCV}</div>,
}));

describe('EditViewCv', () => {
  test('should display no consent view', () => {
    const mockProps = { consent: false } as ResumeProps;

    render(<EditViewCv {...mockProps} />);

    const noConsentView = screen.getByText(CvComponents.NoConsentView);
    const editCv = screen.queryByText(CvComponents.EditCV);
    const viewCv = screen.queryByText(CvComponents.ViewCV);

    expect(noConsentView).toBeInTheDocument();
    expect(editCv).not.toBeInTheDocument();
    expect(viewCv).not.toBeInTheDocument();
  });

  test('should display EditCv in case of edit mode enabled', () => {
    const mockProps = { consent: true, editMode: true } as ResumeProps;

    render(<EditViewCv {...mockProps} />);

    const noConsentView = screen.queryByText(CvComponents.NoConsentView);
    const editCv = screen.getByText(CvComponents.EditCV);
    const viewCv = screen.queryByText(CvComponents.ViewCV);

    expect(noConsentView).not.toBeInTheDocument();
    expect(editCv).toBeInTheDocument();
    expect(viewCv).not.toBeInTheDocument();
  });

  test('should display EditCv in case of no data available', () => {
    const mockProps = { consent: true, editMode: false, data: null } as ResumeProps;

    render(<EditViewCv {...mockProps} />);

    const noConsentView = screen.queryByText(CvComponents.NoConsentView);
    const editCv = screen.getByText(CvComponents.EditCV);
    const viewCv = screen.queryByText(CvComponents.ViewCV);

    expect(noConsentView).not.toBeInTheDocument();
    expect(editCv).toBeInTheDocument();
    expect(viewCv).not.toBeInTheDocument();
  });

  test('should display ViewCv in case no edit mode and data available', () => {
    const mockProps = { consent: true, editMode: false, data: {} } as ResumeProps;

    render(<EditViewCv {...mockProps} />);

    const noConsentView = screen.queryByText(CvComponents.NoConsentView);
    const editCv = screen.queryByText(CvComponents.EditCV);
    const viewCv = screen.getByText(CvComponents.ViewCV);

    expect(noConsentView).not.toBeInTheDocument();
    expect(editCv).not.toBeInTheDocument();
    expect(viewCv).toBeInTheDocument();
  });
});
