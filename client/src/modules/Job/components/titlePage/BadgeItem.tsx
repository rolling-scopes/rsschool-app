import { Badge, Space } from 'antd';

const App: React.FC = () => {

  return (
    <Space >
      <Badge count={44} style={{backgroundColor: "#F0F0F0", color: "#000000", opacity: 0.45,}}  />
    </Space>
  );
};

export default App;