import React from 'react';
import {
  XProvider,
  Bubble,
  Sender,
  Conversations,
  Prompts,
  Suggestion,
  ThoughtChain,
} from '@ant-design/x';
import { Flex, Divider, Radio, Card, Typography } from 'antd';

import type { ConfigProviderProps, GetProp } from 'antd';
import {
  AlipayCircleOutlined,
  BulbOutlined,
  GithubOutlined,
  SmileOutlined,
  UserOutlined,
} from '@ant-design/icons';

export default () => {
  const [value, setValue] = React.useState('');
  const [direction, setDirection] =
    React.useState<GetProp<ConfigProviderProps, 'direction'>>('ltr');

  return (
    <>
      <Flex gap={12} style={{ marginBottom: 16 }} align="center">
        <Typography.Text>Direction:</Typography.Text>
        <Radio.Group value={direction} onChange={(e) => setDirection(e.target.value)}>
          <Radio.Button value="ltr">LTR</Radio.Button>
          <Radio.Button value="rtl">RTL</Radio.Button>
        </Radio.Group>
      </Flex>
      <Card>
        <XProvider direction={direction}>
          <Flex style={{ height: 500 }} gap={12}>
            <Conversations
              style={{ width: 200 }}
              defaultActiveKey="1"
              items={[
                {
                  key: '1',
                  label: 'Conversation - 1',
                  icon: <GithubOutlined />,
                },
                {
                  key: '2',
                  label: 'Conversation - 2',
                  icon: <AlipayCircleOutlined />,
                },
              ]}
            />
            <Divider type="vertical" style={{ height: '100%' }} />
            <Flex vertical style={{ flex: 1 }} gap={8}>
              <Bubble.List
                style={{ flex: 1 }}
                items={[
                  {
                    key: '1',
                    placement: 'end',
                    content: 'Hello Ant Design X!',
                    avatar: { icon: <UserOutlined /> },
                  },
                  {
                    key: '2',
                    content: 'Hello World!',
                  },
                ]}
              />
              <Prompts
                items={[
                  {
                    key: '1',
                    icon: <BulbOutlined style={{ color: '#FFD700' }} />,
                    label: 'Ignite Your Creativity',
                  },
                  {
                    key: '2',
                    icon: <SmileOutlined style={{ color: '#52C41A' }} />,
                    label: 'Tell me a Joke',
                  },
                ]}
              />
              <Suggestion items={[{ label: 'Write a report', value: 'report' }]}>
                {({ onTrigger, onKeyDown }) => {
                  return (
                    <Sender
                      value={value}
                      onChange={(nextVal) => {
                        if (nextVal === '/') {
                          onTrigger();
                        } else if (!nextVal) {
                          onTrigger(false);
                        }
                        setValue(nextVal);
                      }}
                      onKeyDown={onKeyDown}
                      placeholder='Type "/" to trigger suggestion'
                    />
                  );
                }}
              </Suggestion>
            </Flex>
          </Flex>
          <ThoughtChain />
        </XProvider>
      </Card>
    </>
  );
};