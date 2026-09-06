import React, { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AuthContext } from '../hooks/useAuth';
import { User } from '../types';
import * as AuthService from '../services/auth.service';
import { connectSocket, disconnectSocket } from '../services/socket.service';
import toast from 'react-hot-toast';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session
  useEffect(() => {
    const savedToken = localStorage.getItem('coop_itsm_token') || localStorage.getItem('bankcare_token');
    const savedUser = localStorage.getItem('coop_itsm_user') || localStorage.getItem('bankcare_user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('coop_itsm_token');
        localStorage.removeItem('coop_itsm_user');
        localStorage.removeItem('bankcare_token');
        localStorage.removeItem('bankcare_user');
      }
    }
    setIsLoading(false);
  }, []);

  // Connect WebSockets when authenticated
  useEffect(() => {
    if (!token || !user) {
      disconnectSocket();
      return;
    }

    const socket = connectSocket(token);

    // Real-time Notification Event
    socket.on('notification:new', (notification: any) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast(notification.message || 'New notification received', {
        icon: '🔔',
        style: {
          background: '#0B2545',
          color: '#FFFFFF',
          border: '1px solid #1E3A8A',
        },
      });
    });

    // Real-time Incident Created
    socket.on('incident:created', (incident: any) => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['all-incidents'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });

      if (user.role === 'IT_SUPERVISOR' || user.role === 'ADMIN') {
        toast(`New incident reported: ${incident.incidentNumber}`, {
          icon: '⚡',
          style: {
            background: '#0B2545',
            color: '#FFFFFF',
          },
        });
      }
    });

    // Real-time Incident Updated
    socket.on('incident:updated', () => {
      queryClient.invalidateQueries({ queryKey: ['incident'] });
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['all-incidents'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    });

    // Real-time Incident Assigned to current technician
    socket.on('incident:assigned', (incident: any) => {
      queryClient.invalidateQueries({ queryKey: ['incident'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(`You have been assigned to ${incident.incidentNumber}!`);
    });

    // Real-time Incident Resolved
    socket.on('incident:resolved', (incident: any) => {
      queryClient.invalidateQueries({ queryKey: ['incident'] });
      queryClient.invalidateQueries({ queryKey: ['my-incidents'] });
      toast(`Incident ${incident.incidentNumber} resolved. Verification required.`, {
        icon: '✅',
      });
    });

    // Real-time SLA Escalation Alerts
    socket.on('incident:sla_breached', (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['incident'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      if (user.role === 'IT_SUPERVISOR' || user.role === 'ADMIN') {
        toast.error(`SLA Breached: ${data.incidentNumber} (${data.branchName})`);
      }
    });

    socket.on('incident:unassigned_alert', (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      if (user.role === 'IT_SUPERVISOR' || user.role === 'ADMIN') {
        toast(`⚠️ Escalation: ${data.incidentNumber} unassigned > 30 mins`, {
          icon: '⏳',
          style: {
            background: '#7C2D12',
            color: '#FEF3C7',
          },
        });
      }
    });

    return () => {
      socket.off('notification:new');
      socket.off('incident:created');
      socket.off('incident:updated');
      socket.off('incident:assigned');
      socket.off('incident:resolved');
      socket.off('incident:sla_breached');
      socket.off('incident:unassigned_alert');
    };
  }, [token, user, queryClient]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await AuthService.login(email, password);
    if (!data.require2FA && data.token && data.user) {
      localStorage.setItem('coop_itsm_token', data.token);
      localStorage.setItem('coop_itsm_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  }, []);

  const complete2faLogin = useCallback(async (tempToken: string, code: string) => {
    const data = await AuthService.verify2faLogin(tempToken, code);
    localStorage.setItem('coop_itsm_token', data.token);
    localStorage.setItem('coop_itsm_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    disconnectSocket();
    localStorage.removeItem('coop_itsm_token');
    localStorage.removeItem('coop_itsm_user');
    localStorage.removeItem('bankcare_token');
    localStorage.removeItem('bankcare_user');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    localStorage.setItem('coop_itsm_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, complete2faLogin, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
