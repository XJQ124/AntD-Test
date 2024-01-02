import React, { useState, } from 'react';
import { Button, Form, Input, Popconfirm, Table, Drawer } from 'antd';

const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return ( 
    <Form form={form} component={false}>
        <tr {...props} />
    </Form>
  );
};
const EditableCell = ({
  title,  
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing] = useState(false);
  
  let childNode = children;
  if (editable) {
    childNode = editing ? (
     <>
     </>
    ) : (
      <div>
      </div>
    );
  }
  return <td {...restProps}>{childNode}</td>;
};
const App = () => {
  const [drawerData, setDrawerData] = useState({});
  const [open, setOpen] = useState(false);

  const [searchText,setSearchText] = useState('')
  const [count, setCount] = useState(1);

  const [dataSource, setDataSource] = useState([]);

  const [drawerTitle,setDrawerTitle] = useState('添加企业用户')
  const [form] = Form.useForm();

  const { Search } = Input;
  const onSearch = (value, _e, info) => {
    console.log(info?.source, value);
    setSearchText(value)
  }
  //模糊查找部分 filter 过滤器
  const filterData = dataSource.filter(item => 
    item.name.includes(searchText) || item.address.includes(searchText)
    );

  const handleEdit = (key) => {
    setOpen(true);
    const index = dataSource.findIndex((item) => item.key === key);
    if (index !== -1) {
      dataSource[index].editing = true;
      setDrawerData(dataSource[index]);
      setDrawerTitle('编辑用户信息：')
      setDataSource([...dataSource]); 
      form.setFieldsValue(dataSource[index])  
    }
  };

  //删除，不太好理解
  const handleDelete = (key) => {
    const newData = dataSource.filter((item) => item.key !== key);
    setDataSource(newData);
  };

  const defaultColumns = [
    {
      title: '序号',
      dataIndex: 'number',
      width: '25%',
      //序号递增
      render: (_, __, index) => index + 1,
    },
    {
      title: '公司名称',
      dataIndex: 'name',
      width: '25%',
    },
    {
      title: '公司地址',
      dataIndex: 'address',
      width: '25%',
    },
    {
      title: '操作',
      dataIndex: 'operation', 
      width: '25%',
      //两个参数，一个是当前列的值，一个是当前行的数据
      render: (_, record) =>(
        <div>
          <Button style={{marginRight:'5px'}} onClick={() => handleEdit(record.key)} >编辑</Button>
          <Popconfirm title="确认删除吗?" onConfirm={() => handleDelete(record.key)}>
            <Button danger>删除</Button>
          </Popconfirm>
        </div>
      ),
    },
  ];
  const handleAdd = () =>{
    setOpen(true);
    setDrawerData({});
    form.resetFields();  // 重置表单字段，清空输入框内容
  }

  const handleSave = (row) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    if (index !== -1) {
      const item = newData[index];
      newData.splice(index, 1, {
        ...item,
        ...row,
      });
    } else {
      newData.push({
        key: count,
        ...row,
      });
      setCount(count + 1);
    }
    setDataSource(newData);
  };
  //通过遍历 defaultColumns 数组，生成一个新的 columns 数组。
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  //官网写的
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
        rowClassName={() => 'editable-row'}  没用
        bordered    //显示边框
        //数据源修改过了，然后更改查询后的索引值问题
        dataSource={filterData}
        columns={columns}
      />
      <Drawer
        title={drawerTitle} //使用动态的 drawerTitle
        placement="right" 
        closable={true}   
        onClose={() => {
          setOpen(false)
          setDrawerTitle('添加企业用户：')
        }}
        open={open}
        width={400}
      >
        <Form
          form={form}
          onFinish={(values) => {
            //合并得到的新对象
            const mergedData = { ...drawerData, ...values };
            handleSave(mergedData);
            setOpen(false);
            setDrawerTitle('添加企业用户：')
          }}
          initialValues={drawerData}
        >
          <Form.Item label="公司名称" name="name" rules={[{ required: true, message: '请输入公司名称' }]}>
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