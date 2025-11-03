import { Tag, Typography } from 'antd';

const {Text} = Typography;

export function IsGoodCandidateWidget({isGoodCandidate}:{isGoodCandidate: boolean | null}) {
  if (isGoodCandidate === null) {
    return null;
  }

  return(
    <Text>Good candidate: {isGoodCandidate ? <Tag color="green">Yes</Tag> : <Tag color="red">No</Tag>}</Text>
  )
}
