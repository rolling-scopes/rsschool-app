import { Space, Typography } from "antd"
import BadgeItem from "./BadgeItem"

const TitlePage = () => {
    return (
        <Space>
            <Typography.Title  level={4} style={{marginBottom: "0"}}>
                Job posts
            </Typography.Title>
            <BadgeItem count={44} />
        </Space>
    )
}
export default TitlePage
