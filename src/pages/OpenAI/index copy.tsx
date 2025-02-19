import { UserOutlined } from '@ant-design/icons';
import { Bubble, Sender, useXAgent, useXChat } from '@ant-design/x';
import { Flex, type GetProp } from 'antd';
import React from 'react';

// 云开发内核
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

// 或者使用其他登录方式
const auth = app.auth({
    persistence: 'local'
});
await auth.signInAnonymously();
const ai = await app.ai();
// 接下来就可以调用 ai 模块提供的创建模型等方法了

// 创建模型
const aiModel = ai.createModel("deepseek");
const initAi = async () => {
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

//initAi();


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

const OpenAI = () => {
    const [content, setContent] = React.useState('');

    // Agent for request
    const [agent] = useXAgent({
        request: async ({ message }, { onSuccess, onUpdate }) => {
            const fullContent = `Streaming output instead of Bubble typing effect. You typed: ${message}`;
            let currentContent = '';

            const res = await aiModel.streamText({
                model: "deepseek-r1",
                messages: [
                    { role: "user", content: `${message}` },
                ],
            });

            let thinkR1 = "";
            // 当使用 deepseek-r1 时，模型会生成思维链内容
            for await (let data of res.dataStream) {
                // 打印思维链内容
                const think = (data?.choices?.[0]?.delta)?.reasoning_content;
                currentContent = think ? currentContent + think : currentContent;
                onUpdate(currentContent);
                if (think) {
                    // thinkR1 = thinkR1+think;
                    // console.log(thinkR1);
                }

                // 打印生成文本内容
                const text = data?.choices?.[0]?.delta?.content;
                if(text){
                    console.log(text)
                   // currentContent = currentContent + text;
                   // console.log(currentContent);
                   // onUpdate(currentContent);
                }
            }
            //onSuccess(currentContent);

        },
    });

    // Chat messages
    const { onRequest, messages } = useXChat({
        agent,
    });

    return (
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
            />
        </Flex>
    );
};

export default OpenAI;