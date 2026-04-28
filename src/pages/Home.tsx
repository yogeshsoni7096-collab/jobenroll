import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Search, Building2, MapPin, ExternalLink, Calendar, Briefcase, Zap, Brain } from 'lucide-react';
import { motion } from 'motion/react';

interface Job {
  id: string;
  title: string;
  organization: string;
  eligibility: string;
  lastDate: string;
  applyLink: string;
  category: string;
}

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('latest');

  const categories = [
    { id: 'latest', label: 'All Jobs' },
    { id: 'admit_card', label: 'Admit Cards' },
    { id: 'results', label: 'Results' },
    { id: 'answer_key', label: 'Answer Key' },
  ];

  useEffect(() => {
    async function fetchJobs() {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'jobs'),
          where('category', '==', activeCategory)
          // Removed orderBy to avoid immediate index requirement
        );
        const snapshot = await getDocs(q);
        const jobData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
        setJobs(jobData);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        if (jobs.length === 0) {
            setJobs([
                { id: '1', title: 'SSC CGL Executive Officer 2026', organization: 'Staff Selection Commission (SSC)', eligibility: 'Bachelor Degree', lastDate: '2026-05-15', applyLink: 'https://ssc.nic.in', category: 'latest' },
                { id: '2', title: 'UPSC Civil Services Prelims', organization: 'Union Public Service Comm (UPSC)', eligibility: 'Any Graduate', lastDate: '2026-06-01', applyLink: 'https://upsc.gov.in', category: 'latest' },
                { id: '3', title: 'IBPS PO/MT-XI Recruitment', organization: 'Institute of Banking Personnel Selection', eligibility: 'Any Degree', lastDate: '2026-05-20', applyLink: '#', category: 'latest' },
                { id: '4', title: 'RRB NTPC Phase 2 Notification', organization: 'Railway Recruitment Board (RRB)', eligibility: '12th Pass / Graduate', lastDate: '2026-07-10', applyLink: '#', category: 'latest' },
                { id: '5', title: 'SBI Junior Associate', organization: 'State Bank of India (SBI)', eligibility: 'Graduate', lastDate: '2026-05-30', applyLink: '#', category: 'latest' },
                { id: '6', title: 'Delhi Police Constable Vacancy', organization: 'SSC / DP', eligibility: '10+2 Pass', lastDate: '2026-06-15', applyLink: '#', category: 'latest' },
            ]);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, [activeCategory]);

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.organization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Vacancies</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold mt-1 text-slate-800">2,481</h3>
            <span className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full">+124 NEW</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">National Average Speed</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold mt-1 text-slate-800">42 WPM</h3>
            <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-full">TOP 10%</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Career Points</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold mt-1 text-slate-800">4,850</h3>
            <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-full">LVL 12</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col min-h-[600px]">
        {/* Header with Search and Categories */}
        <div className="p-4 border-b border-slate-100 space-y-4 md:space-y-0 md:flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-xl">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-indigo-600 rounded-full"></span>
            <h2 className="font-bold text-slate-800">Latest Job Notifications</h2>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search jobs..."
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                    activeCategory === cat.id 
                      ? 'bg-indigo-600 text-white' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wider font-bold text-slate-400 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Organization & Post</th>
                <th className="px-6 py-4">Eligibility</th>
                <th className="px-6 py-4">Last Date</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-600">
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i} className="border-b border-slate-50 animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-48 mb-2"></div><div className="h-3 bg-slate-50 rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-5 bg-slate-100 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-100 rounded w-24"></div></td>
                    <td className="px-6 py-4 text-right"><div className="h-8 bg-slate-100 rounded w-20 ml-auto"></div></td>
                  </tr>
                ))
              ) : filteredJobs.map((job) => (
                <tr key={job.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{job.organization || 'Public Sector'}</p>
                    <p className="text-xs text-slate-400 font-medium">{job.title || 'Notification'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-slate-100 rounded-md text-[11px] font-bold text-slate-500 border border-slate-200">
                      {job.eligibility || 'Check PDF'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-300" />
                        <span className={`font-medium ${job.lastDate && new Date(job.lastDate) < new Date('2026-06-01') ? 'text-red-500' : 'text-slate-500'}`}>
                            {job.lastDate || 'N/A'}
                        </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <a 
                      href={job.applyLink || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                    >
                      Apply Now
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {!loading && filteredJobs.length === 0 && (
            <div className="py-20 text-center">
              <Briefcase className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <h3 className="text-slate-800 font-bold">No notifications found</h3>
              <p className="text-slate-400 text-sm">Try checking other categories or clearing your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

