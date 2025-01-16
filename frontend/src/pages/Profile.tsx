import React, { useEffect, useState } from 'react'
import { Form, Input, Button, Card, Upload, message, Avatar } from 'antd'
import { UploadOutlined, UserOutlined } from '@ant-design/icons'
import type { UploadProps } from 'antd'

interface UserProfile {
  username: string
  email: string
  bio: string
  avatar: string
}

const Profile: React.FC = () => {
  const [form] = Form.useForm()
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:3000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        form.setFieldsValue(data)
      } else {
        message.error('获取个人资料失败')
      }
    } catch (error) {
      message.error('获取个人资料失败，请稍后重试')
    }
  }

  const onFinish = async (values: UserProfile) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:3000/api/profile/update', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (response.ok) {
        message.success('个人资料更新成功')
        fetchProfile()
      } else {
        const data = await response.json()
        message.error(data.message || '更新失败')
      }
    } catch (error) {
      message.error('更新失败，请稍后重试')
    }
  }

  const uploadProps: UploadProps = {
    name: 'avatar',
    action: 'http://localhost:3000/api/profile/avatar',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    onChange(info) {
      if (info.file.status === 'done') {
        message.success('头像上传成功')
        fetchProfile()
      } else if (info.file.status === 'error') {
        message.error('头像上传失败')
      }
    },
  }

  return (
    <div className="p-6">
      <Card title="个人资料" className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <Avatar
            size={100}
            icon={<UserOutlined />}
            src={profile?.avatar}
            className="mb-4"
          />
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />}>更换头像</Button>
          </Upload>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={profile || {}}
        >
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            label="个人简介"
            name="bio"
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              保存更改
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default Profile 