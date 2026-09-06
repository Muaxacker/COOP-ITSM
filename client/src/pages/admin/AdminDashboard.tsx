import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Building2,
  Layers,
  BarChart3,
  ArrowRight,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Activity,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi, divisionApi, branchApi, userApi } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { LoadingState } from '../../components/ui/States';

export function AdminDashboard() {
  const { data: dashData, isLoading: dashLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const res = await dashboardApi.getDashboard();
      return res.data.data;
    },
  });

  const { data: divisions, isLoading: divLoading } = useQuery({
    queryKey: ['divisions'],
    queryFn: async () => {
      const res = await divisionApi.getDivisions();
      return res.data.data;
    },
  });

  if (dashLoading || divLoading) return <LoadingState message="Loading administration dashboard..." />;

  const kpis = dashData?.kpis || {};

  const tiles = [
    {
      title: 'User Management',
      description: 'Create, modify, assign branch/division, and manage user accounts.',
      icon: <Users className="w-6 h-6 text-blue-600" />,
      stat: kpis.totalUsers ?? 0,
      statLabel: 'Active Users',
      to: '/users',
      accent: 'border-l-4 border-l-blue-600',
    },
    {
      title: 'Bank Branches',
      description: 'Manage 8+ central and regional bank branches across Ethiopia.',
      icon: <Building2 className="w-6 h-6 text-emerald-600" />,
      stat: kpis.totalBranches ?? 0,
      statLabel: 'Connected Branches',
      to: '/branches',
      accent: 'border-l-4 border-l-emerald-600',
    },
    {
      title: 'Divisions & Categories',
      description: 'Configure ATM, Application, Network, and Maintenance SLA rules.',
      icon: <Layers className="w-6 h-6 text-purple-600" />,
      stat: kpis.totalDivisions ?? 4,
      statLabel: 'Technical Divisions',
      to: '/divisions',
      accent: 'border-l-4 border-l-purple-600',
    },
    {
      title: 'Operational Reports',
      description: 'View incident trends, division performance, and SLA compliance.',
      icon: <BarChart3 className="w-6 h-6 text-amber-600" />,
      stat: `${kpis.slaComplianceRate ?? 100}%`,
      statLabel: 'SLA Compliance Rate',
      to: '/reports',
      accent: 'border-l-4 border-l-amber-600',
    },
  ];

  return (
    <div className="space-y-7">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">System Administration</h1>
        <p className="text-sm text-gray-500 mt-1">
          Cooperative Bank of Oromia · Central IT Service Request & Incident Management
        </p>
      </div>

      {/* Quick info banner */}
      <div className="bg-gradient-to-r from-[#0b2545] to-[#134074] rounded-xl p-5 shadow-sm text-white flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
            <Shield className="w-6 h-6 text-blue-300" />
          </div>
          <div>
            <p className="text-base font-semibold">COOP-ITSM Platform Control</p>
            <p className="text-xs text-blue-200 mt-0.5 max-w-xl">
              Centralized administration for role-based access control, branch directory configuration, IT division SLA policies, and service oversight.
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-6 text-right border-l border-white/15 pl-6">
          <div>
            <span className="text-xs text-blue-200 block uppercase font-medium">Active Incidents</span>
            <span className="text-2xl font-bold text-amber-300">{kpis.activeIncidents ?? 0}</span>
          </div>
          <div>
            <span className="text-xs text-blue-200 block uppercase font-medium">Resolved</span>
            <span className="text-2xl font-bold text-emerald-300">{kpis.resolvedIncidents ?? 0}</span>
          </div>
        </div>
      </div>

      {/* Action tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {tiles.map((tile) => (
          <Link key={tile.to} to={tile.to} className="block group">
            <Card className={`h-full hover:shadow-md transition-all cursor-pointer ${tile.accent}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                  {tile.icon}
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                {tile.title}
              </p>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                {tile.description}
              </p>
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-baseline gap-1.5">
                <span className="text-xl font-black text-gray-900">{tile.stat}</span>
                <span className="text-xs text-gray-500">{tile.statLabel}</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* IT Divisions Overview */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-900">Technical Divisions Overview</h2>
          <Link to="/divisions" className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
            Configure Divisions & SLA <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(divisions || []).map((div: any) => (
            <Card key={div.id} className="p-4 bg-white border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-100">
                  {div.code}
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  {div._count?.categories ?? div.categories?.length ?? 0} categories
                </span>
              </div>
              <p className="text-sm font-bold text-gray-800">{div.name}</p>
              {div.description && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{div.description}</p>
              )}
              <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>Technicians</span>
                <span className="font-semibold text-gray-700">
                  {div._count?.users ?? div.users?.length ?? 0}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
