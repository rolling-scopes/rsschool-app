import React from 'react';
import { Space, Checkbox } from 'antd';

type Props = {
  setHiddenColumnsRows: Function,
  hiddenColumnsRows: Set<string>,
  eventTypes: Array<string>,
}

const FilterComponent: React.FC<any> = ({ setHiddenColumnsRows,  hiddenColumnsRows, eventTypes }: Props) => {
    const columnsName: Array<string> = ['Type', 'Special', 'Url', 'Organizer', 'Place'];
    
    const handledFilter = (event: any) => {
        const {value} = event.target;
        const {checked} = event.target;
        if (checked && hiddenColumn.has(value)) {
          setHiddenColumn((prevState:Set<string>) => {
            prevState.delete(value);
            const newArr = Array.from(prevState);
            return new Set([...newArr]);
          });
        }
        if (!checked && !hiddenColumn.has(value)) {
          setHiddenColumn((prevState:Set<string>) => {
            const newArr = Array.from(prevState);
            return new Set([...newArr, value]);
          });
        }
    };
      
    return (
      <Space style={{alignItems: 'flex-start'}}>
        <Space direction="vertical">
          <span style={{fontWeight: 'bold'}}>Events</span>
            {
                columnsName.map((el, ind) => {
                    return <Checkbox key={`${ind}_${el}`} value={el} checked={!hiddenColumn.has(el)} onChange={handledFilter}>{el}</Checkbox>;
                })
             } 
        </Space>
        {
          eventTypes.length !== 0 
          ? (<Space direction="vertical">
              <span style={{fontWeight: 'bold'}}>Columns</span>
              {
                  eventTypes.map((el, ind) => {
                      return <Checkbox key={`${ind}_${el}`} value={el} checked={!hiddenColumnsRows.has(el)} onChange={handledFilter}>{el}</Checkbox>;
                  })
              } 
          </Space>)
          : null
        }
      </Space>  
    );
}

export default FilterComponent;