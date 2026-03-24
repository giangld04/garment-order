// Login page — displays login form inside a centered card

import { Metadata } from 'next';
import LoginForm from '@/components/auth/login-form';

export const metadata: Metadata = {
  title: 'Đăng nhập — Quản lý đơn hàng may mặc',
};

export default function LoginPage() {
  return <LoginForm />;
}
