import React, { useState } from 'react';
import { Modal, Tabs } from 'antd';
import FormAddTask from './FormAddTask';
import useWindowDimensions from '../../utils/useWindowDimensions';
import TaskPreview from '../TaskPreview';

const ModalWindowForForm: React.FC = ({ visible, handleCancel, darkTheme, course }: any) => {
  const [addingItem, setAddingItem] = useState(null);
  const [tag, setTag] = useState('self education');
  const [activeMarker, setActiveMarker] = useState({});
  const [addingLink, setAddingLink] = useState(null);

  const { TabPane } = Tabs;
  const { width } = useWindowDimensions();

  const handleChangeLinks = (e: any) => {
    if (e.target.value) {
      if (addingLink === null) {
        const newArr: any = [e.target.value];
        setAddingLink(newArr);
      }
      if (addingLink) {
        const newArr: any = addingLink;
        newArr.push(e.target.value);
        setAddingLink(newArr);
      }
    }
  };

  const onMapClicked = (mapProps: any, map: any, event: any) => {
    const coords = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };
    setActiveMarker(coords);
  };

  const onFieldsChange = (values: any) => {
    if (values.length) {
      if (values[0].name[0] === 'links') {
        values = {
          ...((addingItem as null) || {}),
          [values[0].name[0]]: addingLink,
        };
      } else {
        values = {
          ...((addingItem as null) || {}),
          [values[0].name[0]]: values[0].value,
        };
      }
      setAddingItem(values);
    }
  };

  const onSelectChange = (e: string) => {
    setTag(e);
  };

  return (
    <Modal
      visible={visible}
      onCancel={handleCancel}
      width={
        width >= 1280 ? '45vw' : width >= 960 && width < 1280 ? '55vw' : width < 960 && width > 800 ? '65vw' : '100vw'
      }
      style={{ maxWidth: '100%', top: 0 }}
      title={
        <Tabs defaultActiveKey="1" style={{ marginBottom: 32 }}>
          <TabPane tab="Add new task" key="1">
            <FormAddTask
              handleCancel={handleCancel}
              onFieldsChange={onFieldsChange}
              onSelectChange={onSelectChange}
              // tag={tag}
              onMapClicked={onMapClicked}
              activeMarker={activeMarker}
              handleChangeLinks={handleChangeLinks}
              darkTheme={darkTheme}
              course={course}
            />
          </TabPane>
          <TabPane tab="Task preview" key="2">
            <TaskPreview addingItem={addingItem} tag={tag} activeMarker={activeMarker} darkTheme={darkTheme} />
          </TabPane>
        </Tabs>
      }
      bodyStyle={{ display: 'none' }}
      footer={false}
    />
  );
};

export default ModalWindowForForm;