import React, { useEffect, useState } from "react";
import { Modal, Input, InputNumber, Form, DatePicker, Checkbox } from "antd";
import { RecordItem } from "../../pages/Home";
import moment from "moment";

interface IProps {
  show: boolean;
  onOk: any;
  onCancel: any;
  initValue?: RecordItem;
}

function RecordModal({ show, onOk, onCancel, initValue }: IProps) {
  const [form] = Form.useForm<RecordItem>();
  useEffect(() => {
    if (initValue) {
      const cloneData = JSON.parse(JSON.stringify(initValue));
      cloneData.date = moment(cloneData.date);
      form.setFieldsValue(cloneData);
    }
  }, [initValue, form]);

  const [auto, SetAuto] = useState(true);
  const handleCalc = (value: any, allValue: RecordItem) => {
    if (auto) {
      form.setFields([
        {
          name: "priceCalc",
          value: allValue.count * allValue.unit * allValue.priceUnit,
        },
      ]);
    }
  };

  return (
    <Modal
      title="记账"
      visible={show}
      onOk={() => {
        form.validateFields().then((value) => {
          onOk(value);
        });
      }}
      onCancel={onCancel}
    >
      <Form form={form} labelCol={{ span: 5 }} onValuesChange={handleCalc}>
        <Form.Item name="id" style={{ display: "none" }}>
          <Input />
        </Form.Item>

        <Form.Item name="aid" style={{ display: "none" }}>
          <Input />
        </Form.Item>

        <Form.Item
          label="日期"
          name="date"
          rules={[{ required: true, message: "这里不能为空" }]}
        >
          <DatePicker />
        </Form.Item>

        <Form.Item
          label="产品型号"
          name="title"
          rules={[{ required: true, message: "这里不能为空" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="客户"
          name="user"
          rules={[{ required: true, message: "这里不能为空" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="规格(kg/桶)"
          name="unit"
          rules={[{ required: true, message: "这里不能为空" }]}
          initialValue={0}
        >
          <InputNumber />
        </Form.Item>

        <Form.Item
          label="数量(桶)"
          name="count"
          rules={[{ required: true, message: "这里不能为空" }]}
          initialValue={0}
        >
          <InputNumber />
        </Form.Item>

        <Form.Item
          label="单价(元/kg)"
          name="priceUnit"
          rules={[{ required: true, message: "这里不能为空" }]}
          initialValue={0}
        >
          <InputNumber />
        </Form.Item>

        <Form.Item label="金额(元)">
          <Form.Item
            name="priceCalc"
            rules={[{ required: true, message: "这里不能为空" }]}
            initialValue={0}
            noStyle
          >
            <InputNumber disabled={auto} />
          </Form.Item>
          <span style={{ marginLeft: 20 }}>
            <Checkbox
              defaultChecked={auto}
              onChange={(e) => {
                SetAuto(e.target.checked);
              }}
            >
              自动计算
            </Checkbox>
          </span>
        </Form.Item>

        <Form.Item
          label="回款(元)"
          name="priceBack"
          rules={[{ required: true, message: "这里不能为空" }]}
          initialValue={0}
        >
          <InputNumber />
        </Form.Item>

        <Form.Item
          label="税票开票(元)"
          name="priceBill"
          required
          initialValue={0}
        >
          <InputNumber />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default RecordModal;