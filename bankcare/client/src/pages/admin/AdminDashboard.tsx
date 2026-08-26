import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Settings, ArrowRight, Shield } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getUsers, getCategories, getDepartments } from '../../services/admin.service';
import { Card } from '../../components/ui/Card';
import { LoadingState } from '../../components/ui/States';

export function AdminDashboard() {
  const { data: usersData } = useQuery({
    queryKey: ['users', '', '', 1],
    queryFn: () => getUsers({ limit: 1 }),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories-all'],
    queryFn: () => getCategories(true),
  });

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: getDepartments,
  });

  const tiles = [
    {
      title: 'User Management',
      description: 'Create, edit, activate/deactivate users and assign roles.',
      icon: <Users className="w-6 h-6 text-teal" />,
      stat: usersData?.total ?? '—',
      statLabel: 'total users',
      to: '/users',
    },
    {
      title: 'Service Rules',
      description: 'Configure service categories, deadlines, and responsible departments.',
      icon: <Settings className="w-6 h-6 text-info" />,
      stat: categories?.length ?? '—',
      statLabel: 'categories',
      to: '/service-rules',
    },
  ];

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Admin Dashboard</h1>
        <p className="text-sm text-text-muted mt-1">
          {departments?.length ?? 0} departments · {categories?.length ?? 0} service categories
        </p>
      </div>

      {/* Quick info banner */}
      <div className="bg-primary rounded-xl p-5 flex items-center gap-4">
        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">BankCare Administration</p>
          <p className="text-xs text-primary-300 mt-0.5">
            Manage the system configuration, user accounts, and service rule settings from here.
          </p>
        </div>
      </div>

      {/* Action tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {tiles.map(tile => (
          <Link key={tile.to} to={tile.to}>
            <Card className="hover:border-teal/40 hover:shadow-md transition-all group cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                  {tile.icon}
                </div>
                <ArrowRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 group-hover:text-teal transition-all" />
              </div>
              <p className="text-base font-semibold text-text-primary">{tile.title}</p>
              <p className="text-sm text-text-muted mt-1">{tile.description}</p>
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-1.5">
                <span className="text-xl font-bold text-text-primary">{tile.stat}</span>
                <span className="text-sm text-text-muted">{tile.statLabel}</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Departments list */}
      {departments && departments.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-text-primary mb-3">Departments</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {departments.map((dept: any) => (
              <Card key={dept.id} className="py-3">
                <p className="text-sm font-semibold text-text-primary">{dept.name}</p>
                {dept.description && (
                  <p className="text-xs text-text-muted mt-0.5">{dept.description}</p>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
