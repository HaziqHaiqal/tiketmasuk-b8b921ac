
import React from 'react';
import Index from '@/pages/Index';
import Browse from '@/pages/Browse';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import CreateEvent from '@/pages/CreateEvent';
import VendorDashboard from '@/pages/VendorDashboard';
import CustomerDashboard from '@/pages/CustomerDashboard';
import AdminPanel from '@/pages/AdminPanel';
import Products from '@/pages/Products';
import Organizers from '@/pages/Organizers';
import QRScanner from '@/pages/QRScanner';
import PaymentStatus from '@/pages/PaymentStatus';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import NotFound from '@/pages/NotFound';
import EventDetails from '@/pages/EventDetails';

export const navItems = [
  {
    to: "/",
    page: <Index />,
  },
  {
    to: "/browse",
    page: <Browse />,
  },
  {
    to: "/login",
    page: <Login />,
  },
  {
    to: "/register",
    page: <Register />,
  },
  {
    to: "/create-event",
    page: <CreateEvent />,
  },
  {
    to: "/vendor-dashboard",
    page: <VendorDashboard />,
  },
  {
    to: "/customer-dashboard",
    page: <CustomerDashboard />,
  },
  {
    to: "/admin",
    page: <AdminPanel />,
  },
  {
    to: "/products",
    page: <Products />,
  },
  {
    to: "/organizers",
    page: <Organizers />,
  },
  {
    to: "/qr-scanner",
    page: <QRScanner />,
  },
  {
    to: "/payment-status",
    page: <PaymentStatus />,
  },
  {
    to: "/forgot-password",
    page: <ForgotPassword />,
  },
  {
    to: "/reset-password",
    page: <ResetPassword />,
  },
  {
    to: "/event/:id",
    page: <EventDetails />,
  },
  {
    to: "*",
    page: <NotFound />,
  },
];
