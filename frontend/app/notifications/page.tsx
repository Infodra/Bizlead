'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import apiClient from '@/lib/api';

interface Notification {
  id: string;
  _id?: string;
  user_id: string;
  title: string;
  message: string;
  notification_type: 'offer' | 'system' | 'update' | 'plan' | 'general';
  admin_updated_field?: string;
  is_read: boolean;
  created_at: string;
  updated_at?: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const user = useAuthStore((state) => state.user);
  const userEmail = user?.email || 'user@example.com';

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        
        const response = await apiClient.get('/api/v1/bizlead/notifications?limit=50');

        setNotifications(response.data.notifications || []);
        setUnreadCount(response.data.unread_count || 0);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = async (notificationId: string) => {
    try {
      await apiClient.post(
        `/api/v1/bizlead/notifications/${notificationId}/mark-as-read`,
        {}
      );

      setNotifications(
        notifications.map((n) =>
          n.id === notificationId || n._id === notificationId
            ? { ...n, is_read: true }
            : n
        )
      );

      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await apiClient.delete(
        `/api/v1/bizlead/notifications/${notificationId}`
      );

      setNotifications(
        notifications.filter(
          (n) => n.id !== notificationId && n._id !== notificationId
        )
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.post(
        '/api/v1/bizlead/notifications/mark-all-as-read',
        {}
      );

      setNotifications(
        notifications.map((n) => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'offer':
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case 'system':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'update':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'plan':
        return <Bell className="w-5 h-5 text-pink-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60)
      );
      return `${diffInMinutes}m ago`;
    }

    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    }

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 text-sm font-medium text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg border border-gray-200">
            <Bell className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No notifications yet
            </h3>
            <p className="text-gray-600 text-center max-w-md">
              You're all caught up! Admin updates about offers or new features will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id || notification._id}
                className={`flex items-start gap-4 p-4 rounded-lg border transition-all ${
                  notification.is_read
                    ? 'bg-gray-50 border-gray-200'
                    : 'bg-white border-pink-200 shadow-sm'
                }`}
              >
                {/* Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.notification_type)}
                </div>

                {/* Content */}
                <div className="flex-grow min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-grow">
                      <h3 className="font-semibold text-gray-900">
                        {notification.title}
                      </h3>
                      <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap break-words">
                        {notification.message}
                      </p>

                      {notification.admin_updated_field && (
                        <p className="text-xs text-gray-500 mt-2 bg-gray-100 px-2 py-1 rounded w-fit">
                          Updated: {notification.admin_updated_field}
                        </p>
                      )}

                      <p className="text-xs text-gray-500 mt-3">
                        {formatDate(notification.created_at)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!notification.is_read && (
                        <button
                          onClick={() =>
                            markAsRead(
                              notification.id || notification._id || ''
                            )
                          }
                          className="p-2 hover:bg-pink-50 rounded-lg transition-colors text-pink-600 hover:text-pink-700"
                          title="Mark as read"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() =>
                          deleteNotification(
                            notification.id || notification._id || ''
                          )
                        }
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-red-600"
                        title="Delete notification"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Unread Indicator */}
                {!notification.is_read && (
                  <div className="flex-shrink-0 w-2 h-2 bg-pink-500 rounded-full mt-2"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
