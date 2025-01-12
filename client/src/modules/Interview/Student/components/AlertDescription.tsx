import css from 'styled-jsx/css';

export const AlertDescription = ({ backgroundImage }: { backgroundImage?: string }) => {
  return (
    <>
      <div className={iconGroup.className} style={{ backgroundImage }} />
      {iconGroup.styles}
    </>
  );
};

const iconGroup = css.resolve`
  div {
    background-image: url(https://cdn.rs.school/sloths/cleaned/lazy.svg);
    background-position: center;
    background-size: contain;
    background-repeat: no-repeat;
    max-width: 270px;
    height: 160px;
    margin: 10px auto;
  }
`;
