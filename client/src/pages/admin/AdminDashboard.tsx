import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Building2,
  Layers,
  BarChart3,
  ArrowRight,
  Shield,
  Activity,
  ArrowUpRight,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi, divisionApi } from '../../services/api';
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

  if (dashLoading || divLoading) return <LoadingState message="Loading administration console..." />;

  const kpis = dashData?.kpis || {};

  const tiles = [
    {
      title: 'User Management',
      description: 'Manage personnel accounts, role permissions, and branch/division affiliations.',
      icon: <Users className="w-5 h-5 text-slate-700" />,
      stat: kpis.totalUsers ?? 0,
      statLabel: 'Active Accounts',
      to: '/users',
    },
    {
      title: 'Bank Branches',
      description: 'Configure central, regional, and district branch locations across Ethiopia.',
      icon: <Building2 className="w-5 h-5 text-slate-700" />,
      stat: kpis.totalBranches ?? 0,
      statLabel: 'Connected Branches',
      to: '/branches',
    },
    {
      title: 'Divisions & SLAs',
      description: 'Configure ATM, Core Apps, Network, and Maintenance divisions and SLA matrices.',
      icon: <Layers className="w-5 h-5 text-slate-700" />,
      stat: kpis.totalDivisions ?? 4,
      statLabel: 'Technical Divisions',
      to: '/divisions',
    },
    {
      title: 'Operational Analytics',
      description: 'Incident turnaround telemetry, SLA compliance, and technician workload reports.',
      icon: <BarChart3 className="w-5 h-5 text-slate-700" />,
      stat: `${kpis.slaComplianceRate ?? 100}%`,
      statLabel: 'SLA Compliance',
      to: '/reports',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-subtle">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Governance & Control</span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-semibold text-slate-700">Cooperative Bank of Oromia</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1.5">System Administration Console</h1>
          <p className="text-sm font-medium text-slate-600 mt-0.5">
            Centralized platform control for role access, branch directory, IT divisions, and SLA governance.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium text-slate-600 bg-slate-50/80 px-3.5 py-2 rounded-md border border-slate-200/80">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-slate-600 font-bold">Active Workload</span>
            <span className="font-extrabold font-mono text-slate-900 text-sm">{kpis.activeIncidents ?? 0}</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-slate-600 font-bold">Resolved</span>
            <span className="font-extrabold font-mono text-slate-900 text-sm">{kpis.resolvedIncidents ?? 0}</span>
          </div>
        </div>
      </div>

      {/* Action tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tiles.map((tile) => (
          <Link key={tile.to} to={tile.to} className="block group">
            <div className="h-full bg-white border border-slate-200/80 rounded-lg p-4 shadow-subtle hover:border-slate-300 hover:shadow-card transition-all cursor-pointer flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded border border-slate-200 bg-slate-50 flex items-center justify-center">
                    {tile.icon}
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-sm font-bold text-slate-900 group-hover:text-brand-900 transition-colors">
                  {tile.title}
                </p>
                <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">
                  {tile.description}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-baseline justify-between">
                <span className="text-xl font-extrabold font-mono text-slate-900 text-sm">{tile.stat}</span>
                <span className="text-xs uppercase font-bold tracking-wider text-slate-500">{tile.statLabel}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* IT Divisions Overview */}
      <div className="bg-white rounded-lg border border-slate-200/80 p-5 shadow-subtle space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Technical Division Configurations</h2>
            <p className="text-sm font-medium text-slate-600 mt-0.5">
              Service catalog structures, SLA assignment rules, and allocated engineering personnel.
            </p>
          </div>
          <Link
            to="/divisions"
            className="text-xs font-semibold text-brand-700 hover:text-brand-900 flex items-center gap-1"
          >
            Configure Divisions & SLA <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {(divisions || []).map((div: any) => (
            <div key={div.id} className="p-3.5 rounded-md border border-slate-200/80 bg-slate-50/40 hover:bg-white transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-800 rounded border border-slate-200">
                  {div.code}
                </span>
                <span className="text-xs text-slate-600 font-mono font-semibold">
                  {div._count?.categories ?? div.categories?.length ?? 0} categories
                </span>
              </div>
              <p className="text-sm font-bold text-slate-900">{div.name}</p>
              {div.description && (
                <p className="text-xs text-slate-600 mt-1 font-medium line-clamp-2 leading-relaxed">{div.description}</p>
              )}
              <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                <span className="text-xs font-semibold">Technicians</span>
                <span className="font-mono font-semibold text-slate-900">
                  {div._count?.users ?? div.users?.length ?? 0}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
