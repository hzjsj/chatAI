import { UserOutlined } from '@ant-design/icons';
import { Bubble, Sender, XStream, useXAgent, useXChat } from '@ant-design/x';
import { Button, Flex, type GetProp } from 'antd';
import React, { useEffect, useRef } from 'react';

import styles from './index.less';
//import cloudbase from "@cloudbase/js-sdk";


// 内核
import cloudbase from "@cloudbase/js-sdk/app"
// 登录模块
import { registerAuth } from "@cloudbase/js-sdk/auth"

// AI 模块
import { registerAi } from "@cloudbase/js-sdk/ai"

// 注册功能模块
registerAuth(cloudbase)

registerAi(cloudbase)

const app = cloudbase.init({
  // 需替换为实际使用环境 id
  env: "hzpc",
});


const roles: GetProp<typeof Bubble.List, 'roles'> = {
  ai: {
    placement: 'start',
    avatar: { icon: <UserOutlined />, style: { background: '#fde3cf' } },
  },
  local: {
    placement: 'end',
    avatar: { icon: <UserOutlined />, style: { background: '#87d068' } },
  },
};

const contentChunks = [
  'He',
  'llo',
  ', w',
  'or',
  'ld!',
  ' Ant',
  ' Design',
  ' X',
  ' is',
  ' the',
  ' best',
  '!',
];

function mockReadableStream() {
  const sseChunks: string[] = [];

  for (let i = 0; i < contentChunks.length; i++) {
    const sseEventPart = `event: message\ndata: {"id":"${i}","content":"${contentChunks[i]}"}\n\n`;
    sseChunks.push(sseEventPart);
  }

  return new ReadableStream({
    async start(controller) {
      for (const chunk of sseChunks) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        controller.enqueue(new TextEncoder().encode(chunk));
      }
      controller.close();
    },
  });
}

export default function Page() {


  const initAi = async () => {
    // 或者使用其他登录方式
    const auth = app.auth({
      persistence: 'local'
    });
    await auth.signInAnonymously();
    const ai = await app.ai();
    // 接下来就可以调用 ai 模块提供的创建模型等方法了

    // 创建模型
    const aiModel = ai.createModel("deepseek");
    const res = await aiModel.streamText({
      model: "deepseek-r1",
      messages: [
        { role: "user", content: "你好，你叫什么名字" },
      ],
    });

    // 当使用 deepseek-r1 时，模型会生成思维链内容
    for await (let data of res.dataStream) {
      // 打印思维链内容
      const think = (data?.choices?.[0]?.delta)?.reasoning_content;
      if (think) {
        console.log(think);
      }

      // 打印生成文本内容
      const text = data?.choices?.[0]?.delta?.content;
      if (text) {
        console.log(text);
      }
    }
  }

  initAi();


  const [content, setContent] = React.useState('');

  const abortRef = useRef(() => { });

  useEffect(() => {
    return () => {
      abortRef.current();
    };
  }, []);

  // Agent for request
  const [agent] = useXAgent({
    request: async (_, { onSuccess, onUpdate }) => {
      const stream = XStream({
        readableStream: mockReadableStream(),
      });

      const reader = stream.getReader();
      abortRef.current = () => {
        reader?.cancel();
      };

      let current = '';
      while (reader) {
        const { value, done } = await reader.read();
        if (done) {
          onSuccess(current);
          break;
        }
        if (!value) continue;
        const data = JSON.parse(value.data);
        current += data.content || '';
        onUpdate(current);
      }
    },
  });

  // Chat messages
  const { onRequest, messages } = useXChat({
    agent,
  });

  const showModal = () => {
    console.log(true);
  };
  return (
    <>
      <div>
        <h1 className={styles.title}>Page index</h1>

        <Button type="primary" onClick={showModal}>
        Open Modal
      </Button>
      </div>
      <Flex vertical gap="middle">
        <Bubble.List
          roles={roles}
          style={{ maxHeight: 300 }}
          items={messages.map(({ id, message, status }) => ({
            key: id,
            role: status === 'local' ? 'local' : 'ai',
            content: message,
          }))}
        />
        <Sender
          loading={agent.isRequesting()}
          value={content}
          onChange={setContent}
          onSubmit={(nextContent) => {
            onRequest(nextContent);
            setContent('');
          }}
          onCancel={() => abortRef.current()}
        />
      </Flex>
    </>

  );
}
