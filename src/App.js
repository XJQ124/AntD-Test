import React, { useContext, useEffect, useRef, useState } from 'react';
import { Button, Form, Input, Popconfirm, Table, Drawer } from 'antd';

const { Search } = Input;
const onSearch = (value, _e, info) => console.log(info?.source, value);

//创建了一个EditableContext上下文对象
//用于在组件之间传递可编辑表格的上下文信息。
const EditableContext = React.createContext(null);

//EditableRow组件用于渲染表格的行
//并通过EditableContext.Provider提供表单上下文。
const EditableRow = ({ index, ...props }) => {
  //创建表单实例
  const [form] = Form.useForm();
  return (
    //将创建的表单实例‘form’绑定 Form 组件上
    //component={false} 表示不生成真正的 HTML 表单元素，而只是提供上下文给子组件使用。
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};
//EditableCell组件是表格中每个可编辑单元格的实现。
//它包含了编辑状态的管理、输入框的渲染以及保存编辑后的处理逻辑。

//定义一个函数，其包含一些属性
const EditableCell = ({
  title,  
  editable,
  children,
  //用途：表示该列在数据源中的索引，用于获取或更新数据源中对应项的值。
  //类型：字符串。
  dataIndex,
  //用途：表示该行的数据对象，包含了当前单元格所在行的所有数据。
  record,
  handleSave,
  ...restProps
}) => {
  //创建一个editing的状态变量，用于跟踪当前单元格是否处于编辑状态。
  //setEditing 是一个用于更新 editing 状态的函数。
  const [editing, setEditing] = useState(false);
  //创建一个名为 inputRef 的引用，用于在编辑状态下引用输入框元素。这个引用将用于自动聚焦到输入框
  const inputRef = useRef(null);
  //使用 React 上下文 useContext 钩子获取上层组件提供的 EditableContext 上下文的值，即表单实例。
  const form = useContext(EditableContext);
  useEffect(() => {
    if (editing) {
      inputRef.current.focus();
    }
  }, [editing]);
  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({
      [dataIndex]: record[dataIndex],
    });
  };
  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({
        ...record,
        ...values,
      });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };
  let childNode = children;
  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{
          margin: 0,
        }}
        name={dataIndex}
        rules={[
          {
            required: true,
            message: `${title} is required.`,
          },
        ]}
      >
        <Input ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{
          paddingRight: 24,
        }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }
  return <td {...restProps}>{childNode}</td>;
};
const App = () => {
  const [drawerData, setDrawerData] = useState({});
  //定义抽屉的可见和不可见
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [count, setCount] = useState(2);
  const [dataSource, setDataSource] = useState([]);
  const handleEdit = (key) => {
    const newData = dataSource.map((item) => {
      if (item.key === key) {
        return { ...item, editing: true };
      }
      return item;
    });
    setDataSource(newData);
  };


  const handleDelete = (key) => {
    const newData = dataSource.filter((item) => item.key !== key);
    setDataSource(newData);
  };
  //默认的列
  const defaultColumns = [
    {
      title: '序号',
      dataIndex: 'name',
      width: '30%',
      // editable: true,
      render: (_, __, index) => index + 1,
    },
    {
      title: '公司名称',
      dataIndex: 'age',
    },
    {
      title: '公司地址',
      dataIndex: 'address',
    },
    {
      title: '操作',
      dataIndex: 'operation',
      render: (_, record) =>(
        <div>
          <Button style={{marginRight:'5px'}} onClick={() => handleEdit(record.key)} >编辑</Button>
          <Popconfirm title="Sure to delete?" onConfirm={() => handleDelete(record.key)}>
            {/* <a>Delete</a> */}
            <Button danger>删除</Button>
          </Popconfirm>
        </div>
      ),
        // dataSource.length >= 1 ? (
        //   <Popconfirm title="Sure to delete?" onConfirm={() => handleDelete(record.key)}>
        //     <a>删除</a>
        //   </Popconfirm>
        // ) : null,
    },
  ];

  const handleAdd = () =>{
    setDrawerVisible(true);
    //重置drawerData状态
    setDrawerData({});
    // setCount(count + 1);
  }


  const handleSave = (row) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    if (index !== -1) {
      // 更新现有行
      const item = newData[index];
      newData.splice(index, 1, {
        ...item,
        ...row,
      });
    } else {
      // 添加新行
      newData.push({
        key: count,
        ...row,
      });
      setCount(count + 1);
    }
    setDataSource(newData);
  };
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  const columns = defaultColumns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    };
  });
  return (
    <div style={{padding:'20px'}}>
      <Button
        onClick={handleAdd}
        type="primary"
        style={{
          marginBottom: 16,marginRight: '20px'
        }}
      >
        添加企业用户
      </Button>
      <Search
        placeholder="查询企业信息"
        onSearch={onSearch}
        style={{
          width: 200,
        }}
      /> 
      <Table
        components={components}
        rowClassName={() => 'editable-row'}
        bordered
        dataSource={dataSource}
        columns={columns}
      />
      <Drawer
        title="添加企业用户"
        placement="right"
        closable={true}
        onClose={() => setDrawerVisible(false)}
        visible={drawerVisible}
        width={400}
      >
        <Form
          onFinish={(values) => {
            // 将表单值与 drawerData 合并
            const mergedData = { ...drawerData, ...values };

            // 使用 handleSave 更新表格数据
            handleSave(mergedData);

            // 隐藏 Drawer
            setDrawerVisible(false);
          }}
          initialValues={drawerData}
        >

          {/* 在这里添加你的表单字段 */}

          <Form.Item label="公司名称" name="age" rules={[{ required: true, message: '请输入公司名称' }]}>
            <Input />
          </Form.Item>

          <Form.Item label="公司地址" name="address" rules={[{ required: true, message: '请输入公司地址' }]}>
            <Input />
          </Form.Item>

          <Button type="primary" htmlType="submit">
            提交
          </Button>
        </Form>
      </Drawer>

    </div>
  );
};
export default App;