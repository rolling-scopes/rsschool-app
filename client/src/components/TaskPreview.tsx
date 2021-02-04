import React from 'react';
import { Card, Avatar, Empty, Rate, Tag } from 'antd';
import moment from 'moment';
// import MapComponent from '../../TaskPageDrawer/Map';
// import UploadFilesView from '../../TaskPageDrawer/UploadFilesView';
// import { tagColor } from '../../TaskPageDrawer/utils';
// import { tagsMap } from './settingsData';

const { Meta } = Card;

interface Props {
  addingItem: any,
  tag: any,
  darkTheme: any,
  activeMarker?: any,
  userPreferences?: any
}

const TaskPreview: React.FC<Props> = ({ addingItem, tag, darkTheme, activeMarker, userPreferences }) => {
  const owlsImage = 'https://res.cloudinary.com/dv4fxot90/image/upload/v1601110530/schedule/owls_big_xkdavi.png';
  const slothImage = 'https://res.cloudinary.com/dv4fxot90/image/upload/v1601109894/schedule/sloth_big_jsio5q.png';
  const owlsAvatar = 'https://res.cloudinary.com/dv4fxot90/image/upload/v1601110529/schedule/owls_ava_emxxwe.png';
  const slothAvatar = 'https://res.cloudinary.com/dv4fxot90/image/upload/v1601110529/schedule/sloth_ava_fmo9ir.png';
  const previewCover = darkTheme ? owlsImage : slothImage;
  const previewAvatar = darkTheme ? owlsAvatar : slothAvatar;

  const renderTag = (tag: string) => {
    // const tagColor = tagsMap.get(tag) || 'self_education';
    return (
      <Tag
        // className={userPreferences.readable ? 'readable-bold-1' : ''}
        // style={{
        //   borderColor: userPreferences.tagColor[tagColor],
        //   color: userPreferences.tagColor[tagColor],
        //   backgroundColor: `${userPreferences.tagColor[tagColor]}10`,
        // }}
        key={tag}
      >
        {tag}
      </Tag>
    );
  };

  const renderLinks = () => {
    if (addingItem.links) {
      const linksList = addingItem.links.map((link, i) => {
        return (
          <a key={`${link}${i}`} href={link}>
            {link}
          </a>
        );
      });
      return linksList;
    }
  };
  if (addingItem) {
    return (
      <Card
        style={{ margin: 'auto' }}
        cover={
          <div className="task-preview-cover">
            <img className="task-preview-image" alt="sloth" src={previewCover} />
          </div>
        }
      >
        <Meta
          title={
            <>
              <Avatar src={previewAvatar} />
              {addingItem.author && <span className="task-preview-author">{addingItem.author}</span>}
            </>
          }
          description={
            <>
              <div className="info-tag-wrapper">
                <h1 className="task-page-drawer-title">{addingItem.name}</h1>
                {addingItem.rating && <Rate allowHalf value={addingItem()} />}
                {addingItem.tag && (
                  <Tag color={tagColor(addingItem.tag)} key={addingItem.tag}>
                    {addingItem.tag}
                  </Tag>
                )}
                {tag && renderTag(tag)}
                {addingItem.date && <span>{moment(addingItem.date).format('YYYY-MM-DD')}</span>}
              </div>
              {addingItem.deadline && (
                <div className="info-tag-wrapper">
                  <Tag color="red" key={addingItem.deadline}>
                    {'deadline'}
                  </Tag>
                  <span>{moment(addingItem.deadline).format('YYYY-MM-DD')}</span>
                </div>
              )}
              {addingItem.duration && <p className="info-text">Duration: {addingItem.duration}</p>}
              <p>{addingItem.id}</p>
              {addingItem.description && <p className="info-text">Description: {addingItem.description}</p>}
              {addingItem.result && <p className="info-text">Result: {addingItem.result}</p>}
              {addingItem.remark && <p className="info-text">Remark: {addingItem.remark}</p>}
              {addingItem.links && <div className="info-link-wrapper">{renderLinks()}</div>}
              {/* {activeMarker && Object.keys(activeMarker).length !== 0 && (
                <div className="task-modal-map">
                  <MapComponent darkTheme={darkTheme} activeMarker={activeMarker} />
                </div>
              )}
              {addingItem.photo && (
                <>
                  <UploadFilesView fileType="photo" />
                </>
              )}
              {addingItem.video && (
                <div>
                  <UploadFilesView fileType="video" />
                </div>
              )} */}
            </>
          }
        />
      </Card>
    );
  }
  if (!addingItem) {
    return <Empty>No data for preview, please, fill the form</Empty>;
  }

  return (
    <>
    </>
  )
};

export default TaskPreview;
