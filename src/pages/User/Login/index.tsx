import {
  AlipayCircleOutlined,
  LockOutlined,
  MobileOutlined,
  TaobaoCircleOutlined,
  UserOutlined,
  WeiboCircleOutlined,
} from '@ant-design/icons';
import {
  LoginForm,
  ProConfigProvider,
  ProFormCaptcha,
  ProFormCheckbox,
  ProFormText,
  setAlpha,
} from '@ant-design/pro-components';
import { Space, Tabs, message, theme } from 'antd';
import type { CSSProperties } from 'react';
import { useState } from 'react';
import styles from './index.less';

import { getVerification, verification } from '@/utils';

type LoginType = 'phone' | 'account';

interface LoginParamsType {
  username: string;
  password: string;
  mobile: string;
  captcha: string;
  type?: string;
}

export default () => {
  const { token } = theme.useToken();
  const [loginType, setLoginType] = useState<LoginType>('phone');

  const iconStyles: CSSProperties = {
    marginInlineStart: '16px',
    color: setAlpha(token.colorTextBase, 0.2),
    fontSize: '24px',
    verticalAlign: 'middle',
    cursor: 'pointer',
  };
  const [verificationId, setVerificationId] = useState(
    'eyJhbGciOiJSUzI1NiIsImtpZCI6IjlkMWRjMzFlLWI0ZDAtNDQ4Yi1hNzZmLWIwY2M2M2Q4MTQ5OCJ9.eyJleHAiOjE3NDA2MjMyNTIsImtpZCI6IjY3MTI0MDgyLWY3ZWQtNGYxOC04NWRmLTA3OWE1OWFhY2M0MCIsInAiOiIrODYgMTkzNTUzNTA1MjUiLCJwaiI6Imxvd2NvZGUtOWc4Nms0aGJjODdkZmY3YyIsInQiOiJBR055Y0hRT0F3Nnl3VlBPIn0.NWV1UKLPHk62z2mSN0ac7r7jcB7j9sB9T6ZuNbAcpoAAUPZjmK7i29m-fl596fROGurz5nRoo-m6dtKVKXPIEnwFNgyev-PeJLMemH0OqnJ4tzza7LChxg7YEHuC066pbjEf_MSVwe_XvzAiimUxdhNUnl-pOwcpZ-iZeCf30xnL69wq3ekXsaQq8pfpogNR6rYu2xbMqS3iuXqbABnHZHs9wrHYXV9QwejAwCIychcOQD2uRXSpQMlg2c95ItdoFP0lztKcJY1qJWju4IBPf7aa60Pypxwe2uj9Lw1j1G4uLJB51JxeXigKIeK28ZYEeb3wzwaevzHnpprR_FKbzQ',
  );

  // const getMobile = async()=>{

  // }
  const handleSubmit = async (values: LoginParamsType) => {
    if (loginType === 'phone') {
      const { mobile, captcha } = values;
      try {
        const loginInfo = await verification(mobile, verificationId, captcha);
        message.success('登录成功');
        console.log('loginInfo', loginInfo);
      } catch (error) {
        // 登录异常
        console.log(error);
      }
    }
    // console.log('LoginParamsType', values);
    // // setSubmitting(true);
    // // setLoginErrorMessage('');

    // const { username, password } = values;

    // let loginSuccess = false;
    // try {
    //   // 用户名密码登录
    //   await loginWithPassword(username.trim(), password.trim());
    //   message.success('登录成功');
    // } catch (error) {
    //   // 登录异常
    //   console.log(error);
    // }

    // //setSubmitting(false);
    // return Promise.resolve(loginSuccess);
  };

  return (
    <ProConfigProvider hashed={false}>
      <div
        className={styles.container}
        style={{ backgroundColor: token.colorBgContainer }}
      >
        <LoginForm
          logo="https://github.githubassets.com/favicons/favicon.png"
          title="Github"
          subTitle="全球最大的代码托管平台"
          actions={
            <Space>
              其他登录方式
              <AlipayCircleOutlined style={iconStyles} />
              <TaobaoCircleOutlined style={iconStyles} />
              <WeiboCircleOutlined style={iconStyles} />
            </Space>
          }
          // onFinish={async (values) => {
          //   //console.log("onFinish",values)
          //   await handleSubmit(values as API.LoginParams);
          // }}
          onFinish={(values) => {
            handleSubmit(values as LoginParamsType);
          }}
        >
          <Tabs
            centered
            activeKey={loginType}
            onChange={(activeKey) => setLoginType(activeKey as LoginType)}
          >
            <Tabs.TabPane key={'account'} tab={'账号密码登录'} />
            <Tabs.TabPane key={'phone'} tab={'手机号登录'} />
          </Tabs>
          {loginType === 'account' && (
            <>
              <ProFormText
                name="username"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined className={'prefixIcon'} />,
                }}
                placeholder={'用户名: admin or user'}
                rules={[
                  {
                    required: true,
                    message: '请输入用户名!',
                  },
                ]}
              />
              <ProFormText.Password
                name="password"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined className={'prefixIcon'} />,
                  strengthText:
                    'Password should contain numbers, letters and special characters, at least 8 characters long.',
                  statusRender: (value) => {
                    const getStatus = () => {
                      if (value && value.length > 12) {
                        return 'ok';
                      }
                      if (value && value.length > 6) {
                        return 'pass';
                      }
                      return 'poor';
                    };
                    const status = getStatus();
                    if (status === 'pass') {
                      return (
                        <div style={{ color: token.colorWarning }}>
                          强度：中
                        </div>
                      );
                    }
                    if (status === 'ok') {
                      return (
                        <div style={{ color: token.colorSuccess }}>
                          强度：强
                        </div>
                      );
                    }
                    return (
                      <div style={{ color: token.colorError }}>强度：弱</div>
                    );
                  },
                }}
                placeholder={'密码: ant.design'}
                rules={[
                  {
                    required: true,
                    message: '请输入密码！',
                  },
                ]}
              />
            </>
          )}
          {loginType === 'phone' && (
            <>
              <ProFormText
                fieldProps={{
                  size: 'large',
                  prefix: <MobileOutlined className={'prefixIcon'} />,
                }}
                name="mobile"
                initialValue={19355350525}
                placeholder={'手机号'}
                rules={[
                  {
                    required: true,
                    message: '请输入手机号！',
                  },
                  {
                    pattern: /^1\d{10}$/,
                    message: '手机号格式错误！',
                  },
                ]}
              />
              <ProFormCaptcha
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined className={'prefixIcon'} />,
                }}
                captchaProps={{
                  size: 'large',
                }}
                placeholder={'请输入验证码'}
                captchaTextRender={(timing, count) => {
                  if (timing) {
                    return `${count} ${'获取验证码'}`;
                  }
                  return '获取验证码';
                }}
                name="captcha"
                rules={[
                  {
                    required: true,
                    message: '请输入验证码！',
                  },
                ]}
                phoneName="mobile"
                onGetCaptcha={async (phone) => {
                  const phoneInfo = await getVerification(phone);
                  console.log('phoneInfo.is_user', phoneInfo.is_user);
                  if (phoneInfo) {
                    console.log('phoneInfo', phoneInfo);
                    message.success('获取验证码成功');
                    setVerificationId(phoneInfo.verification_id);
                  }
                }}
              />
            </>
          )}
          <div
            style={{
              marginBlockEnd: 24,
            }}
          >
            <ProFormCheckbox noStyle name="autoLogin">
              自动登录
            </ProFormCheckbox>
            <a
              style={{
                float: 'right',
              }}
            >
              忘记密码
            </a>
          </div>
        </LoginForm>
      </div>
    </ProConfigProvider>
  );
};
