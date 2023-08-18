
import React from 'react';
import { List } from 'antd';
import Link from 'next/link';

type LinkInfo = { icon: React.ReactNode; name: string; link: string; newTab: boolean };

const Menu = (props: any) => {


    

    

    return (
      <div style={{ marginBottom: 16 }}>
        <h3>{props.title}</h3>
        <List
          size="small"
          dataSource={props.data}
          renderItem={(linkInfo: LinkInfo) => (
            <List.Item key={linkInfo.link}>
              <Link prefetch={false} href={linkInfo.link} target={linkInfo.newTab ? '_blank' : '_self'}>
                {linkInfo.icon}&nbsp;{linkInfo.name}
              </Link>
            </List.Item>
          )}
        />
      </div>
    ); 
};




export { Menu };
