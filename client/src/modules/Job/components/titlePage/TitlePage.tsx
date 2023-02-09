import { Space, Typography } from "antd"
import BadgeItem from "./BadgeItem"


function TitlePage() {
    return (
        <Space>
            <Typography.Title level={4} style={{marginBottom: "0"}}>
                Job posts
            </Typography.Title>
            <BadgeItem />
        </Space>
    )
}
export default TitlePage