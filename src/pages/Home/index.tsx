import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { isLogin } from "../../utils";
import {
  Button,
  PageHeader,
  Menu,
  Table,
  message,
  Popconfirm,
  Space,
  Statistic,
} from "antd";
import { TableOutlined, MenuOutlined } from "@ant-design/icons";

import styles from "./index.module.css";
import InputModal from "../../components/InputModal";
import {
  createAccount,
  createRecord,
  deleteAccount,
  deleteRecord,
  getAccountList,
  getRecordList,
  updateAccount,
  updateRecord,
} from "../../service";
import { useRequest } from "ahooks";
import { ColumnProps } from "antd/lib/table";
import RecordModal from "../../components/RecordModal";
import { Moment } from "moment";

export interface AccountItem {
  id: string | number;
  title: string;
}

export interface RecordItem {
  id: string | number;
  aid: string | number;
  date: string | Moment;
  title: string;
  user: string;
  unit: number;
  count: number;
  priceUnit: number;
  priceCalc: number;
  priceBack: number;
  priceBill: number;
}

const isMobile = document.body.clientWidth < 960;

function Home() {
  const history = useHistory();
  if (!isLogin()) {
    history.push("/login");
  }

  const { data: accountList, run: fetchAccountList } = useRequest(
    getAccountList,
    {
      formatResult: (res) => res.data,
    }
  );

  const {
    data: recordList,
    run: fetchRecordList,
    loading: loadingRecordList,
  } = useRequest(getRecordList, {
    manual: true,
    formatResult: (res) => res.data,
  });

  const columns: ColumnProps<RecordItem>[] = [
    {
      title: "序号",
      render(_, record, index) {
        return index + 1;
      },
    },
    {
      dataIndex: "date",
      title: "日期",
      render: (value) => value.slice(0, 10),
      sorter: (a, b) => (a <= b ? -1 : 1),
    },
    { dataIndex: "title", title: "型号" },
    { dataIndex: "user", title: "客户" },
    { dataIndex: "unit", title: "规格（kg/桶）" },
    { dataIndex: "count", title: "数量（桶）" },
    { dataIndex: "priceUnit", title: "单价（元/kg）" },
    { dataIndex: "priceCalc", title: "金额（元）" },
    { dataIndex: "priceBack", title: "回款（元）" },
    { dataIndex: "priceBill", title: "税票开票合计（元）" },
    {
      title: "操作",
      render(value, record) {
        return (
          <Space>
            <Button
              type="link"
              onClick={() => {
                handleUpdateRecord(record);
              }}
            >
              修改
            </Button>
            <Popconfirm
              title="是否删除这条记账信息？"
              onConfirm={() => {
                handleDeleteRecord(record.id);
              }}
            >
              <Button type="link" danger>
                删除
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  const [aid, SetAid] = useState<string>();
  const handleChangeAccount = ({ key }: { key: string }) => {
    fetchRecordList(key);
    SetAid(key);
  };

  const handleAddAccount = () => {
    InputModal.ask("请输入账本名称").then((value: string) => {
      createAccount(value).then(() => {
        message.success("创建成功");
        fetchAccountList();
      });
    });
  };

  const handleExit = () => {
    localStorage.clear();
    history.push("/login");
  };

  const handleDeleteAccount = () => {
    aid &&
      deleteAccount(aid).then(() => {
        message.success("删除成功");
        SetAid(undefined);
        fetchAccountList();
      });
  };

  const handleEditAccount = () => {
    aid &&
      InputModal.ask("请输入新的账本标题").then((value: string) => {
        updateAccount(value, aid).then(() => {
          message.success("修改成功");
          fetchAccountList();
        });
      });
  };

  const getTitle = () => {
    return accountList?.find((item) => item.id === aid)?.title;
  };

  const [modalInfo, SetModalInfo] = useState({
    show: false,
    onOk: (value: RecordItem) => {},
    onCancel: () => {
      SetModalInfo({
        ...modalInfo,
        show: false,
      });
    },
    initValue: undefined as RecordItem | undefined,
  });

  const handleCreateRecord = () => {
    if (aid) {
      const newModalInfo = {
        ...modalInfo,
        initValue: undefined,
        show: true,
        onOk: (data: RecordItem) => {
          data.aid = aid;
          createRecord(data).then(() => {
            message.success("创建成功");
            aid && fetchRecordList(aid);
            SetModalInfo({
              ...modalInfo,
              show: false,
            });
          });
        },
      };
      SetModalInfo(newModalInfo);
    }
  };

  const handleUpdateRecord = (record: RecordItem) => {
    if (aid) {
      const newModalInfo = {
        ...modalInfo,
        show: true,
        onOk: (data: RecordItem) => {
          updateRecord(data).then(() => {
            message.success("创建成功");
            fetchRecordList(aid);
            SetModalInfo({
              ...modalInfo,
              show: false,
            });
          });
        },
        initValue: record,
      };
      SetModalInfo(newModalInfo);
    }
  };

  const handleDeleteRecord = (rid: string | number) => {
    deleteRecord(rid).then(() => {
      message.success("删除成功");
      aid && fetchRecordList(aid);
    });
  };

  const [collapse, setCollapse] = useState(isMobile);

  return (
    <div>
      {/* 导航栏 */}
      <PageHeader
        ghost={false}
        backIcon={<MenuOutlined />}
        onBack={() => {
          setCollapse(!collapse);
        }}
        title="记账中心"
        extra={[
          <Button key="1" type="primary" onClick={handleExit}>
            退出
          </Button>,
        ]}
      />
      {/* 中部区域 */}
      <div className={styles.mainContainer}>
        <div
          className={styles.menu}
          style={{
            maxWidth: collapse ? "0" : "200px",
            position: "sticky",
            top: 20,
          }}
        >
          <div style={{ textAlign: "center", padding: 10 }}>
            <Button type="primary" onClick={handleAddAccount}>
              新建账本
            </Button>
          </div>
          <Menu mode="inline" onClick={handleChangeAccount}>
            {accountList &&
              accountList.map((accountItem) => {
                return (
                  <Menu.Item key={accountItem.id} icon={<TableOutlined />}>
                    {accountItem.title}
                  </Menu.Item>
                );
              })}
          </Menu>
        </div>
        <div
          className={styles.mainBox}
          style={{ maxWidth: collapse ? "100%" : "calc(100% - 200px)" }}
        >
          {aid ? (
            <div>
              <PageHeader
                title={getTitle()}
                extra={[
                  <Button key="0" type="primary" onClick={handleCreateRecord}>
                    记账
                  </Button>,
                  <Button key="1" type="default" onClick={handleEditAccount}>
                    修改账本名称
                  </Button>,
                  <Popconfirm
                    key="2"
                    title="是否确认删除该账本？"
                    onConfirm={handleDeleteAccount}
                  >
                    <Button danger>删除账本</Button>
                  </Popconfirm>,
                ]}
              />
              <div className={styles.dataBox}>
                <div className={styles.dataItem}>
                  <Statistic
                    title="金额总计 (元)"
                    value={recordList?.reduce(
                      (p, record) => p + Number(record.priceCalc),
                      0
                    )}
                    precision={2}
                  />
                </div>
                <div className={styles.dataItem}>
                  <Statistic
                    title="回款总计 (元)"
                    value={recordList?.reduce(
                      (p, record) => p + Number(record.priceBack),
                      0
                    )}
                    precision={2}
                  />
                </div>
                <div className={styles.dataItem}>
                  <Statistic
                    title="税票总计 (元)"
                    value={recordList?.reduce(
                      (p, record) => p + Number(record.priceBill),
                      0
                    )}
                    precision={2}
                  />
                </div>
              </div>
              <Table
                style={{ margin: 10 }}
                rowKey="id"
                columns={columns}
                dataSource={recordList}
                loading={loadingRecordList}
                pagination={false}
                scroll={{ x: 1300 }}
              />
            </div>
          ) : (
            <div className={styles.message}>打开左侧菜单选择一个账本</div>
          )}
        </div>
      </div>
      {/* 其他组件 */}
      <RecordModal {...modalInfo} />
    </div>
  );
}

export default Home;
