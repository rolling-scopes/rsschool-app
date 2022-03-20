import { PropsWithChildren } from 'react';
import css from 'styled-jsx/css';

export function DataTextValue({ children }: PropsWithChildren<{}>) {
  return (
    <>
      <span className="course-data-key">{children}</span>
      <style jsx>{styles}</style>
    </>
  );
}

const styles = css`
  .course-data-key {
    font-size: 14px;
    padding-right: 8px;
    white-space: nowrap;
    width: 80px;
    display: inline-block;
  }
`;
