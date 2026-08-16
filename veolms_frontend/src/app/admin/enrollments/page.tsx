'use client';

import React, { useEffect, useState } from 'react';
import { EnrollmentRecord } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatPrice } from '@/lib/utils';
import api from '@/lib/api';
import { CreditCard } from 'lucide-react';

export default function AdminEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<EnrollmentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrollments = async () => {
      setLoading(true);
      try {
        const res = await api.get('/admin/enrollments?limit=30');
        setEnrollments(res.data.data?.enrollments || []);
      } catch (err) {
        console.error('Error fetching enrollments', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-100">Enrollments & Payment Ledger</h2>
        <p className="text-xs text-slate-400">Transaction history and course access allocations.</p>
      </div>

      <Card className="border-slate-800 p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading payment ledger...</div>
        ) : enrollments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 uppercase text-[10px] tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-4">Student</th>
                  <th className="p-4">Course Enrolled</th>
                  <th className="p-4">Amount Paid</th>
                  <th className="p-4">Provider</th>
                  <th className="p-4">Enrolled At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {enrollments.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-900/40">
                    <td className="p-4 font-semibold text-slate-100">
                      <div>{record.user.name}</div>
                      <span className="text-[10px] text-slate-500">{record.user.email}</span>
                    </td>
                    <td className="p-4 text-indigo-300 font-medium">{record.course.title}</td>
                    <td className="p-4 font-bold text-emerald-400">
                      {formatPrice(record.payment?.amount || 0)}
                    </td>
                    <td className="p-4">
                      <Badge variant="cyan">{record.payment?.provider || 'RAZORPAY'}</Badge>
                    </td>
                    <td className="p-4 text-slate-500">
                      {new Date(record.enrolledAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500">No enrollment records recorded yet.</div>
        )}
      </Card>
    </div>
  );
}
