import cloudbase from '@cloudbase/js-sdk';
import React, { createContext, useEffect, useState } from 'react';

export const CloudbaseContext = createContext(null);
export interface IAppProps {
  children?: React.ReactNode;
}
export const CloudbaseProvider = ({ children }: IAppProps) => {
  const [cloudbaseApp, setCloudbaseApp] = useState(null);

  useEffect(() => {
    const initialize = async () => {
      const app: any = cloudbase.init({
        env: 'lowcode-0gl79jkz1ee16c8b', // 替换为你的云开发环境 ID
        //clientId: 'your-cloud-env-id', // 替换为你的云开发环境 ID
      });
      const auth = app.auth({
        persistence: 'local',
      });
      await auth.signInAnonymously({}); // 或者使用其他登录方式
      setCloudbaseApp(app);
    };

    initialize();
  }, []);

  return (
    <CloudbaseContext.Provider value={cloudbaseApp}>
      {children}
    </CloudbaseContext.Provider>
  );
};
