import { GithubOutlined } from '@ant-design/icons';
import { Button, Card, Flex } from 'antd';
import * as React from 'react';
import ThemeSwitch from '@client/components/ThemeSwitch';
import styles from './index.module.css';

const { Meta } = Card;

export default function LoginPage() {
  return (
    <main>
      <div className={styles.loginForm}>
        <div style={{ width: 320, height: 120 }} className={styles.loginImage} />
        <Card
          style={{ width: 320 }}
          cover={
            <img
              className={styles.loginCardImg}
              alt="example"
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPYAAADNCAMAAAC8cX2UAAABSlBMVEX///8gHx/0yrGc2vB8uuYAAACsXFEbGhqe3fPzx6weHR30ybCa2fARAAAaGRn70Lai4/rZ2dmkpKQvLi4SEBAXDAc4ODhnjZvGnIfi4uKIvM8nKy0NExZ5eHguNjgODQ2T0e309PRYWFgAAAtCQUEaFBKJx+rIyMjv7++0tLSqVkrS0tKnT0JTR0GGhoYADBHasZplZWVPaXKZmZmSdWb659z2077O7PdOTU28vLyvr69zc3OOjo5dXV2tinj88uz43c235PTm9ftMQTt/Z1vQp5HjuaK2cmnHlpDo1NK/hn7ZubXTrKi+noucgnOJc2Y5R0x5p7dqkJ7F6fZ0rdVnVUvr29mjRTe0bmW7f3few8DcqJPIiXjSmYbisJpKYWkYJSpBU1m1zNVNZm9beoZdhJw9UmNJZ31mlrlTeJJFYHR8sMmkz+262vG2lajvAAASD0lEQVR4nO2d/UPayLrHiXRMCCGAvFQURAQEAUFKqyBoVZR22yq0Xbeu2929nrq9u+e0//+vdyYJZCbvUMzEc/n+sGshCfOZ55nnmZlMJj7fQgsttJCR6gAAsV0/jD7or6QO620W/lL3QX/FuXKAZRhezEL2TOmBfqOUYQDIijz8IVB+oN+YUh3AKOLjkHz+Nk/VGRDnxz8CVub+AzOpGWdU8VnQ7sz18p02yPLYL4jtuV5+ZgGGlAiYw7ldvBMDoub63vDykhabYVjA7Mzl2hCa1V0dzNebZlQvqysYAk/+eHSrFgygGSaemUOpf1gFrROOXf0oZXNmLpez+Lbc1Lm3UqWxeRZ/Vul9fGwV0NMdnKp2WvVuO8mDibJM4SjTWylFyTpogbjZhYFVbbmklCk2LF+sqh7X6TVjEmY2LrJYaOZ5UYxnpW/amZWSjFRNWl22alYY99SxKB9s4qgdlju9dhxSxY1aKiZehEeBZPcw1TPxbwV7foliZrWssBkmG+sllf6VQ7GohqyvqW88rqtuXUSGzdrYeHrFPdAtb5pGngeTWKAN7fO1rVrhw8gLGcwkbT+keJY2NB3sOG1oOtgibWgqbZtnaEP7fFsUQlqSNrTP16WQwI5oQ8Nemk135QGUrdOG9vkOrTunDyEvzKZFKWA/1PzsFMpRwPbCZJrridsLfVMKMc0LEY1C4/bIRHly7gNqG2W9wJ1yv78CmrShfWXRbWMj7hZt7IL7xmbop+6M+2kbifLtXsvp4odUnGZYy2WdTwTPWTQny5vuD7/G4rPUbglVabk4UpbajU8K82iYgN0d1QcStXgmK06p05Kkamxa5jZYveGu6AzFKEwVawQoUFvdz3cLez4Lg6YShSlTrcQt97FjFEZeWrnfM/eAj9NYorbiBWz3l6hRWMWgl/t3w9apjb1wud24PdG03Z9lod5Fk+X27TAnEY0XxTQmUWRZi5bBsyJ5fNrB5KTbMc1uORqfTudju9fD52MNz693d/uxdAMqrZH0Way/u3t9Lh17dXUF/3t+3YcfW4cQ0eVRmHUgZxux86tVMx3LWMPz8+FQYjw2P/S837Dq+rsdyq3GIXxjVwa5uNhTdHFxYYpG6EI9Z08+5fg6bf5bbi9asrgDlE4i6L1BcEmjYDAwGAx0dSCRwi8CQd0ZSwHEfrzbMP0xlwdh5j3yxjUkGegAZlZwb3V12DBr4i5jm/ZW8s9XLwLzg5Z0sXpsFtpcxmZMitF4vro3Z2iogSm3y08SxIxLAann6N8Et3H79kTbbpxrqIOBQEAfqBxIe2Jg9bkht8vYhpE8vUtSB4InL16c7E8PHgzsozODWJAIrJ6n6WMb3RngY0S7DgZfyMe+PJkyxgVOlF95geW0wWrf4DddxjbqrjSOL3DqffXoF1NxB16oZ+6r3HvHBuZ2GftIjy1em1FDg0/BHXiJn7mkcl8..."
            />
          }
          actions={[
            <Button
              key={'github'}
              onClick={() => (window.location.href = `/api/v2/auth/github/login${location.search}`)}
              size="large"
              icon={<GithubOutlined />}
              type="primary"
            >
              Sign up with GitHub
            </Button>,
          ]}
        >
          <Meta
            title="Please login via GitHub"
            description="In order to access the RS School App, you need to login with your GitHub account"
          />
        </Card>
        <Flex align="center" justify="center" style={{ marginTop: 20 }}>
          <ThemeSwitch />
        </Flex>
      </div>
    </main>
  );
}
