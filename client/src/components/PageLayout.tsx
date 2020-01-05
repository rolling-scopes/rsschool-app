import { Header } from './Header';
import { Spin } from 'antd';

type Props = { loading: boolean; githubId: string; courseName: string; title: string; children: any };

export function PageLayout(props: Props) {
  return (
    <>
      <Header title={props.title} username={props.githubId} courseName={props.courseName} />
      <Spin spinning={props.loading}>{props.children}</Spin>
    </>
  );
}
