'use client';

import React, { useEffect, useState } from 'react';
import { Student } from '@/types';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';
import { Users, Search } from 'lucide-react';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchStudents = async (searchTerm = '') => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/students?search=${encodeURIComponent(searchTerm)}&limit=20`);
      setStudents(res.data.data?.students || []);
    } catch (err) {
      console.error('Error fetching students', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents(search);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100">Registered Students</h2>
          <p className="text-xs text-slate-400">View enrolled students and their subscription counts.</p>
        </div>

        <form onSubmit={handleSearch} className="w-full sm:w-72">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by student name/email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="glass-input rounded-xl pl-10 pr-4 py-2 text-xs w-full focus:outline-none"
            />
          </div>
        </form>
      </div>

      <Card className="border-slate-800 p-0 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading student directory...</div>
        ) : students.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 uppercase text-[10px] tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-4">Student Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Enrolled Courses</th>
                  <th className="p-4">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-900/40">
                    <td className="p-4 font-semibold text-slate-100">{student.name}</td>
                    <td className="p-4 text-slate-400">{student.email}</td>
                    <td className="p-4 font-bold text-indigo-400">{student.enrolledCourseCount}</td>
                    <td className="p-4 text-slate-500">
                      {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500">No students found.</div>
        )}
      </Card>
    </div>
  );
}
