import { Modal, Input } from "antd";

function InputModal() {}

InputModal.ask = function (title: string) {
  return new Promise<string>((resolve, reject) => {
    let value = "";
    Modal.confirm({
      title,
      content: (
        <Input
          onChange={(event) => {
            value = event.target.value;
          }}
        />
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

export default InputModal;
