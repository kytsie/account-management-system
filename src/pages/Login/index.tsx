import React from "react";
import { Card, Form, Input, Button } from "antd";
import styles from "./index.module.css";
import { postLogin } from "../../service";
import { useHistory } from "react-router-dom";

export interface LoginForm {
  username: string;
  password: string;
}

function Login() {
  const history = useHistory();
  const onFinish = (formData: LoginForm) => {
    postLogin(formData).then(() => {
      history.replace("/home");
    });
  };
  return (
    <div>
      <Card title="登录" className={styles.loginBox}>
        <Form
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 19 }}
          onFinish={onFinish}
        >
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: "请输入用户名" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 5, span: 19 }}>
            <Button type="primary" htmlType="submit">
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default Login;
