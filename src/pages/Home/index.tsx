import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { isLogin, json2excel } from "../../utils";
import {
  Button,
  PageHeader,
  Table,
  message,
  Popconfirm,
  Space,
  Statistic,
  Form,
  Input,
  Tooltip,
} from "antd";
import ProLayout, { PageContainer } from "@ant-design/pro-layout";
import {
  TableOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  LogoutOutlined,
  CloudDownloadOutlined,
} from "@ant-design/icons";
import "@ant-design/pro-layout/dist/layout.css";
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
import moment, { Moment } from "moment";

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

  const [keyword, setKeyword] = useState("");

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
    formatResult: (res) => {
      const result = res.data.map((item, index) => ({
        ...item,
        tempId: index + 1,
      }));
      result.sort((a, b) => b.tempId - a.tempId);
      return result;
    },
  });

  const columns: ColumnProps<RecordItem>[] = [
    {
      title: "序号",
      dataIndex: "tempId",
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
            <Tooltip placement="top" title="修改">
              <Button
                type="link"
                onClick={() => {
                  handleUpdateRecord(record);
                }}
                icon={<EditOutlined />}
              />
            </Tooltip>

            <Popconfirm
              title="是否删除这条记账信息？"
              onConfirm={() => {
                handleDeleteRecord(record.id);
              }}
            >
              <Tooltip placement="top" title="删除">
                <Button type="link" danger icon={<DeleteOutlined />} />
              </Tooltip>
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
    if (isMobile) setCollapse(!collapse);
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

  const handleExportExcel = () => {
    if (recordList) {
      const result = [...recordList];
      result.sort((a, b) => a.tempId - b.tempId);
      const excelData: any = result.map((item) => ({
        tempId: item.tempId,
        date: item.date.toString().slice(0, 10),
        title: item.title,
        user: item.user,
        unit: item.unit,
        count: item.count,
        priceUnit: item.priceUnit,
        priceCalc: item.priceCalc,
        priceBack: item.priceBack,
        priceBill: item.priceBill,
      }));
      excelData.unshift({
        tempId: "序号",
        date: "日期",
        title: "型号",
        user: "客户",
        unit: "规格（kg/桶）",
        count: "数量（桶）",
        priceUnit: "单价（元/kg）",
        priceCalc: "金额（元）",
        priceBack: "回款（元）",
        priceBill: "税票开票（元）",
      });
      excelData.push({
        tempId: "合计",
        date: "",
        title: "",
        user: "",
        unit: "",
        count: "",
        priceUnit: "",
        priceCalc: recordList?.reduce(
          (p, record) => p + Number(record.priceCalc),
          0
        ),
        priceBack: recordList?.reduce(
          (p, record) => p + Number(record.priceBack),
          0
        ),
        priceBill: recordList?.reduce(
          (p, record) => p + Number(record.priceBill),
          0
        ),
      });
      json2excel(
        excelData,
        `${getTitle()}账本导出（${moment().format("YYYY-MM-DD")}）.xlsx`
      );
    }
  };

  const [collapse, setCollapse] = useState(isMobile);

  return (
    <div>
      <ProLayout
        layout="mix"
        navTheme="light"
        headerTheme="light"
        collapsed={collapse}
        onCollapse={() => {
          setCollapse(!collapse);
        }}
        menuProps={{
          onClick: handleChangeAccount,
          selectedKeys: [aid || "0"],
        }}
        fixSiderbar
        title="记账中心"
        rightContentRender={() => (
          <div>
            <Button
              key="1"
              type="primary"
              onClick={handleExit}
              icon={<LogoutOutlined />}
            >
              退出
            </Button>
          </div>
        )}
        menuDataRender={() =>
          accountList?.map((account) => ({
            key: account.id.toString(),
            path: account.id.toString(),
            name: account.title,
            icon: <TableOutlined />,
          })) || []
        }
        menuExtraRender={() =>
          !collapse && (
            <div style={{ textAlign: "center", padding: 10 }}>
              <Button type="primary" onClick={handleAddAccount}>
                新建账本
              </Button>
            </div>
          )
        }
      >
        <PageContainer header={{ style: { display: "none" } }}>
          {aid ? (
            <div>
              <PageHeader
                title={getTitle()}
                extra={[
                  <Tooltip key="0" placement="top" title="记账">
                    <Button
                      type="primary"
                      onClick={handleCreateRecord}
                      icon={<PlusOutlined />}
                    />
                  </Tooltip>,
                  <Tooltip
                    key="1"
                    placement="top"
                    title="导出数据到Excel表格文件"
                  >
                    <Button
                      type="default"
                      style={{ backgroundColor: "#237804", color: "#fff" }}
                      onClick={handleExportExcel}
                      icon={<CloudDownloadOutlined />}
                    />
                  </Tooltip>,
                  <Tooltip key="2" placement="top" title="修改账本名称">
                    <Button
                      type="default"
                      onClick={handleEditAccount}
                      icon={<EditOutlined />}
                    />
                  </Tooltip>,
                  <Popconfirm
                    key="3"
                    title="是否确认删除该账本？"
                    onConfirm={handleDeleteAccount}
                  >
                    <Tooltip placement="top" title="删除账本">
                      <Button danger icon={<DeleteOutlined />} />
                    </Tooltip>
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
              <Form style={{ margin: 10 }}>
                <Form.Item label="快速检索" name="keyword">
                  <Input
                    style={{ width: 300 }}
                    allowClear
                    onChange={(e) => {
                      setKeyword((e.target as any).value);
                    }}
                  />
                </Form.Item>
              </Form>
              <Table
                style={{ margin: 10 }}
                rowKey="id"
                bordered
                columns={columns}
                dataSource={recordList?.filter(
                  (record) =>
                    keyword === "" || JSON.stringify(record).includes(keyword)
                )}
                loading={loadingRecordList}
                scroll={{ x: 1300 }}
                size="small"
              />
            </div>
          ) : (
            <div className={styles.message}>打开左侧菜单选择一个账本</div>
          )}
        </PageContainer>
      </ProLayout>

      {/* 其他组件 */}
      <RecordModal {...modalInfo} />
    </div>
  );
}

export default Home;
