import { LoginForm } from "./pages/Login";
import { notification } from "antd";
import axios from "axios";
import { AccountItem, RecordItem } from "./pages/Home";
import qs from "qs";

const urlMap = {
  // development: 'http://localhost:8080',
  development: "https://jz.kytsie.cn/v2/public/index.php",
  test: "https://jz.kytsie.cn/v2/public/index.php",
  production: "https://jz.kytsie.cn/v2/public/index.php",
};

const showError = (message: string) => {
  notification.error({
    message,
  });
};

axios.defaults.withCredentials = true;
axios.defaults.baseURL = urlMap[process.env.NODE_ENV];
axios.interceptors.request.use((config) => {
  if (config.method === "post") {
    config.headers = {
      "Content-Type": "application/x-www-form-urlencoded",
    };
    config.data = qs.stringify(config.data);
  }
  return config;
});
axios.interceptors.response.use((response) => {
  if (response.status === 200) {
    const data: any = response.data;
    if (data.code !== 200 && data.message) {
      showError(data.message);
      return Promise.reject(data);
    }
    return data;
  } else {
    showError(response.statusText);
    return response;
  }
});

export function postLogin(data: LoginForm) {
  return axios.post("/user/login", data).then((res) => {
    sessionStorage.setItem("token", res.data);
  });
}

export function getAccountList() {
  return axios.get<AccountItem[]>("/account/get");
}

export function getRecordList(aid: number | string) {
  return axios.get<RecordItem[]>("/record/get", { params: { aid } });
}

export function createAccount(title: string) {
  return axios.get<number>("/account/create", { params: { title } });
}

export function createRecord(data: RecordItem) {
  return axios.post<number>("/record/create", data);
}

export function updateAccount(title: string, aid: string | number) {
  return axios.get<number>("/account/update", { params: { title, aid } });
}

export function updateRecord(data: RecordItem) {
  return axios.post<number>("/record/update", data);
}

export function deleteAccount(aid: string | number) {
  return axios.get<number>("/account/delete", { params: { aid } });
}

export function deleteRecord(rid: string | number) {
  return axios.get<number>("/record/delete", { params: { rid } });
}
