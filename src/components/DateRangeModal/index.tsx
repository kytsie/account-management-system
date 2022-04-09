import { Modal, DatePicker, ConfigProvider } from "antd";
import zh from "antd/lib/locale/zh_CN";
import moment, { Moment } from "moment";

const { RangePicker } = DatePicker;

function DateRangeModel() {}

DateRangeModel.ask = function (
  title: string,
  start: string | Moment,
  end: string | Moment
) {
  return new Promise<{ from: Moment; to: Moment }>((resolve, reject) => {
    let value = {
      from: moment(start),
      to: moment(end),
    };
    Modal.confirm({
      title,
      content: (
        <ConfigProvider locale={zh}>
          <RangePicker
            defaultValue={[value.from, value.to]}
            onChange={(e: any) => {
              value.from = e[0];
              value.to = e[1];
            }}
          />
        </ConfigProvider>
      ),
      onCancel: () => {
        reject("");
      },
      onOk: () => {
        resolve(value);
      },
      cancelText: "取消",
      okText: "确定",
    });
  });
};

export default DateRangeModel;
