import cloudbase from '@cloudbase/js-sdk';
import { notification } from 'antd';
import { history, request } from 'umi';
import { isDevEnv, random } from './common';
import { codeMessage, RESOURCE_PREFIX } from './constants';
import { getDay, getFullDate, getMonth, getYear } from './date';
import { templateCompile } from './templateCompile';

interface IntegrationRes {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
  isBase64Encoded: true | false;
}

let app: any;
let auth: any;

/**
 * 获取 CloudBase App 实例
 */
export async function getCloudBaseApp() {
  const loginState = await auth.getLoginState();

  if (!loginState && !isDevEnv()) {
    history.push('/login');
  }

  return app;
}

/**
 * 初始化云开发 app、auth 实例
 */
function initCloudBaseApp() {
  if (!app) {
    app = cloudbase.init({
      env: 'hzpc',
      // 默认可用区为上海
      //region: window.TcbCmsConfig.region || 'ap-shanghai',
    });
    console.log('init cloudbase app');
  }

  if (!auth) {
    console.log('init cloudbase app auth');
    auth = app.auth({ persistence: 'local' });
  }
  console.log('initCloudBaseApp');
}

initCloudBaseApp();

/**
 * 获取手机验证信息
 */
export async function getVerification(mobile: string) {
  // 1. 发送手机验证码
  const phoneNumber = `+86 ${mobile}`;
  return await auth.getVerification({
    phone_number: phoneNumber,
    target: 'ANY',
  });
}

/**
 * 获取手机验证信息
 */
export async function verification(
  mobile: string,
  verificationId: string,
  verificationCode: string,
) {
  const phoneNumber = `+86 ${mobile}`;
  // 假设已收到用户填入的验证码"000000"
  // 验证验证码的正确性
  const verificationTokenRes = await auth.verify({
    verification_id: verificationId,
    verification_code: verificationCode,
  });

  console.log('verificationTokenRes', verificationTokenRes);

  const resLoginInfo = await auth.signUp({
    phone_number: phoneNumber,
    verification_code: verificationCode,
    verification_token: verificationTokenRes.verification_token,
    // 可选，设置用户名
    //username: mobile,
    // 可选，设置密码
    //password: 'passwordA123',
  });
  console.log('resLoginInfo', resLoginInfo);
  if (!resLoginInfo) {
  }

  // 3. 注册
  // 如果该用户已经存，则登录
  if (1) {
    // await auth.signIn({
    //   username: phoneNumber,
    //   verification_token: verificationTokenRes.verification_token,
    // });
  } else {
    // 否则，则注册新用户，注册新用户时，可以设置密码，用户名
    // 备注：signUp 成功后，会自动登录
    await auth.signUp({
      phone_number: phoneNumber,
      verification_code: verificationCode,
      verification_token: verificationTokenRes.verification_token,
      // 可选，设置昵称
      name: '手机用户',
      // 可选，设置密码
      password: 'password',
      // 可选，设置登录用户名
      username: 'username',
    });
  }
}
/**
 * 用户名密码登录
 * @param username
 * @param password
 */
export async function loginWithPassword() {
  // 登陆
  //await auth.signInWithUsernameAndPassword(username, password);

  //
  // 若使用邮箱验证，第一步代码改为
  const email = 'vue3@qq.com';
  //const phoneNumber = '+86 19355350525';

  const verification = await auth.getVerification({
    email: email,
    //phone_number: phoneNumber,
  });

  //   const verificationCode = "163448";
  //   const codeInfo = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjlkMWRjMzFlLWI0ZDAtNDQ4Yi1hNzZmLWIwY2M2M2Q4MTQ5OCJ9.eyJleHAiOjE3NDA1Njg4NjEsImtpZCI6IjE4M2E2OTM3LTkzYzYtNDVlNi1iMjgzLTk3ZDkzOTBjNDM4ZiIsInAiOiIrODYgMTkzNTUzNTA1MjUiLCJwaiI6Imh6cGMiLCJ0IjoiQUdOeWNIUU9Bd3EzeDFETyJ9.EDpjVBYtHDGg0svXnZQrf8W0RnzUULsKhMsN1n_r7tQpThPBlyDJu7lMveaGxD_7r5GNKKl1GtG6T2DkfGRt_lNVobUebW9x7JP3_pA8TE-nU1_x8VNPzSKxFcjv1b3eOG3QBZnr8oM6LEVnxos_HTvtB63iAGX9ZJRnnix_4dCBhg9fUP94zOnf9_EVY5c4HrmLMNaY2xeFyKCUtV00usliHLP_H2DPRhD3Ucs-odfzBIoCBuGhzaoKkCsdxp5uPy6cxaWwi67QAaPqX4-hm2p37MkkH2uRYFXy6NjhY0l-VdUsX47b2GUVVT7sa_xpKWUX9wjdSCWx-2gXPOqHbA"

  // const verification = await auth.verify({
  //   verification_code: verificationCode,
  //   verification_id: codeInfo,
  // });
  //const res = await auth.signIn(username, password);
  //const res = await auth.signInAnonymously();
  console.log('verification', verification);
}

/**
 * 获取当前登录态信息
 */
export async function getLoginState() {
  // 获取登录态
  return auth.getLoginState();
}

/**
 * 同步获取 x-cloudbase-credentials
 */
export function getAuthHeader() {
  return auth.getAuthHeader();
}

let gotAuthHeader = false;
let gotAuthTime = 0;
/**
 * 异步获取 x-cloudbase-credentials 请求 Header
 */
export async function getAuthHeaderAsync() {
  // 直接读取本地
  let res = auth.getAuthHeader();
  const diff = Date.now() - gotAuthTime;

  // TODO: 当期 SDK 同步获取的 token 可能是过期的
  // 临时解决办法：在首次获取时、间隔大于 3500S 时，刷新 token
  if (!res?.['x-cloudbase-credentials'] || !gotAuthHeader || diff > 3500000) {
    res = await auth.getAuthHeaderAsync();
    gotAuthHeader = true;
    gotAuthTime = Date.now();
  }

  return res;
}

/**
 * 退出登录
 */
export async function logout() {
  await auth.signOut();
}

/**
 * 调用微信 Open API
 * @param action 行为
 * @param data POST body 数据
 */
export async function callWxOpenAPI(
  action: string,
  data?: Record<string, any>,
) {
  console.log(`callWxOpenAPI 参数`, data);

  if (isDevEnv()) {
    return request(`/api/${action}`, {
      data,
      prefix: 'http://127.0.0.1:5003',
      method: 'POST',
    });
  }

  const wxCloudApp = getWxCloudApp();

  // 添加 authHeader
  const authHeader = getAuthHeader();

  const functionName = `${RESOURCE_PREFIX}-openapi`;

  // 调用 open api
  const { result } = await wxCloudApp.callFunction({
    name: functionName,
    data: {
      body: data,
      headers: authHeader,
      httpMethod: 'POST',
      queryStringParameters: '',
      path: `/api/${action}`,
    },
  });
  return parseIntegrationRes(result);
}

/**
 * 解析函数集成响应
 */
function parseIntegrationRes(result: IntegrationRes) {
  // 转化响应值
  let body;
  try {
    body =
      typeof result.body === 'string' && result.body?.length
        ? JSON.parse(result.body)
        : result.body;
  } catch (error) {
    console.log(error);
    body = result.body;
  }

  if (body?.error) {
    const errorText = codeMessage[result?.statusCode || 500];
    notification.error({
      message: errorText,
      description: `请求错误：【${body.error.code}】: ${body.error.message}`,
    });
    throw new Error('服务异常');
  }

  return body;
}

/**
 * 上传文件到文件存储、静态托管
 */
export async function uploadFile(options: {
  /**
   * 需要上传的文件
   */
  file: File;

  /**
   * 指定上传文件的路径
   */
  filePath?: string;

  /**
   * 文件名随机的长度
   */
  filenameLength?: number;

  /**
   * 进度事件
   */
  onProgress?: (v: number) => void;
  /**
   * 文件上传存储类型，静态网站托管或云存储
   * 默认为 storage
   */
  uploadType?: 'hosting' | 'storage';

  /**
   * 路径模版，根据模版规则做动态替换
   * 以 cloudbase-cms 为基础路径
   */
  filePathTemplate?: string;
}): Promise<{
  fileId: string;
  url: string;
}> {
  const {
    file,
    onProgress,
    filePath,
    filenameLength = 32,
    filePathTemplate,
  } = options;

  const app = await getCloudBaseApp();
  const day = getFullDate();

  // 文件名
  let ext;
  if (file.name?.length && file.name.includes('.')) {
    ext = file.name.split('.').pop();
    ext = `.${ext}`;
  } else {
    ext = '';
  }

  // 模版变量
  const templateData: any = {
    // 文件扩展
    ext,
    // 文件名
    filename: file.name,
    // 今日日期
    date: day,
    // 年份，如 2021
    year: getYear(),
    // 月份，如 03
    month: getMonth(),
    // 日，如 02
    day: getDay(),
  };

  // 添加 random1 到 random64
  for (let i = 1; i <= 64; i++) {
    templateData[`random${i}`] = random(i);
  }

  let uploadFilePath: string;

  // 路径模版优先级最高
  if (filePathTemplate) {
    uploadFilePath =
      'cloudbase-cms/' + templateCompile(filePathTemplate, templateData);
  } else {
    uploadFilePath =
      filePath ||
      `cloudbase-cms/upload/${day}/${random(filenameLength)}_${ext}`;
  }

  // 上传文件到云存储
  const result = await app.uploadFile({
    filePath: file,
    cloudPath: uploadFilePath,
    onUploadProgress: (progressEvent: ProgressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total,
      );
      onProgress?.(percentCompleted);
    },
  });

  const meta = {
    fileId: result.fileID,
    url: result.download_url,
  };

  // 文件 id
  return meta;
}

// 获取文件的临时访问链接
export async function getTempFileURL(fileID: string): Promise<string> {
  const app = await getCloudBaseApp();
  const result = await app.getTempFileURL({
    fileList: [fileID],
  });

  if (result.fileList[0].code !== 'SUCCESS') {
    throw new Error(result.fileList[0].code);
  }

  return result.fileList[0].tempFileURL;
}

/**
 * 批量获取文件临时访问链接
 */
export async function batchGetTempFileURL(fileIds: string[]): Promise<
  {
    fileID: string;
    tempFileURL: string;
  }[]
> {
  if (!fileIds?.length) return [];
  const app = await getCloudBaseApp();
  const result = await app.getTempFileURL({
    fileList: fileIds,
  });

  result.fileList.forEach((ret: any) => {
    if (ret.code !== 'SUCCESS') {
      throw new Error(ret.code);
    }
  });

  return result.fileList;
}

/**
 * 判断一个 URL 是否为 FileId
 */
export const isFileId = (v: string) => /^cloud:\/\/\S+/.test(v);

export const getFileNameFromUrl = (url: string) => {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname || '';
    return pathname.split('/').pop();
  } catch (error) {
    // 直接 split
    return url.split('/').pop() || '';
  }
};

export function fileIdToUrl(fileID: string) {
  if (!fileID) {
    return '';
  }

  // 非 fileId
  if (!/^cloud:\/\//.test(fileID)) {
    return fileID;
  }

  // cloudId: cloud://cms-demo.636d-cms-demo-1252710547/cloudbase-cms/upload/2020-09-15/Psa3R3NA4rubCd_R-favicon-wx.svg
  let link = fileID.replace('cloud://', '');
  // 文件路径
  const index = link.indexOf('/');
  // envId.bucket
  const prefix = link.slice(0, index);
  // [envId, bucket]
  const splitPrefix = prefix.split('.');

  // path 路径
  const path = link.slice(index + 1);

  let envId;
  let trimBucket;
  if (splitPrefix.length === 1) {
    trimBucket = splitPrefix[0];
  } else if (splitPrefix.length === 2) {
    envId = splitPrefix[0];
    trimBucket = splitPrefix[1];
  }

  if (envId) {
    envId = envId.trim();
  }

  return `https://${trimBucket}.tcb.qcloud.la/${path}`;
}
