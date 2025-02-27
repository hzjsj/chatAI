const InnerDefaultValue: Partial<ITcbCmsConfing> = {
    // 可用区，默认上海，可选：ap-shanghai 或 ap-guangzhou
    region: 'ap-shanghai',
    // 路由方式：hash 或 browser
    history: 'hash',
    // 环境 Id
    envId: 'Your EnvId',
    // 禁用通知
    disableNotice: false,
    // 禁用帮助按钮
    disableHelpButton: false,
    // 云接入默认域名/自定义域名 + 云接入路径，不带 https 协议符
    // https://console.cloud.tencent.com/tcb/env/access
    cloudAccessPath: 'xxx-xxx.service.tcloudbase.com/tcb-ext-cms-service',
    appName: 'CloudBase',
    cmsTitle: 'CloudBase CMS',
    cmsLogo: './icon.svg',
    cmsDocLink: 'https://docs.cloudbase.net/cms/intro.html',
    cmsHelpLink: 'https://support.qq.com/products/148793',
    officialSiteLink: 'https://cloudbase.net',
  }
  
  /**
   * 获取 CMS 配置，适配小程序 OR 腾讯云
   */
  export const getCmsConfig = (key: keyof ITcbCmsConfing, defaultValue?: any) => {
    // 获取 CMS 配置
    return window.TcbCmsConfig[key] || defaultValue || InnerDefaultValue[key] || ''
  }
  