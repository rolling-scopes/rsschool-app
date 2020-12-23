import React from 'react';
import { Space, Checkbox } from 'antd';

const FilterComponent: React.FC<any> = ({setHiddenColumn,  hiddenColumn}) => {
    const columnsName: Array<string> = ['Type', 'Special', 'Url', 'Organizer', 'Place'];

    const handledFilter = (event: any): void => {
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
        <Space direction="vertical" >
            <strong>Columns</strong>
             {
                columnsName.map((el, ind) => {
                    return <Checkbox key={`${ind}_${el}`} value={el} checked={!hiddenColumn.has(el)} onChange={handledFilter}>{el}</Checkbox>;
                })
            } 
        </Space>
    );
}

export default FilterComponent;