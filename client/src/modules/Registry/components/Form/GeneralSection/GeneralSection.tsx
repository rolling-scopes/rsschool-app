import { Dispatch, SetStateAction } from 'react';
import css from 'styled-jsx/css';
import { Location } from 'common/models';
import { PersonalInfo, ContactInfo } from 'modules/Registry/components';

type Props = {
  location: Location | null;
  setLocation: Dispatch<SetStateAction<Location | null>>;
};

const styles = css`
  :global(.ant-form-item) {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  :global(.ant-row .ant-form-item-row) {
    position: relative;
    display: block;
    max-width: 360px;
    width: 100%;
  }

  @media (min-width: 650px) {
    :global(.ant-form-item-label) {
      position: absolute;
      width: 140px;
      left: -140px;
    }

    :global(.buttons .ant-form-item-control-input-content) {
      display: flex;
      justify-content: flex-end;
    }
  }
`;

export function GeneralSection({ location, setLocation }: Props) {
  return (
    <>
      <PersonalInfo setLocation={setLocation} location={location} />
      <ContactInfo />
      <style jsx>{styles}</style>
    </>
  );
}
