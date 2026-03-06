import { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { getMenuProductsByRestaurant } from '@/services/menuapi';
import { getMenuReviewAnalysis } from '@/services/reviewapi';

const formatDateInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDefaultStartDate = () => {
  const now = new Date();
  return formatDateInput(new Date(now.getFullYear(), now.getMonth(), 1));
};

const getDefaultEndDate = () => formatDateInput(new Date());

function Reviews() {
  const [menuItems, setMenuItems] = useState([]);
  const [isMenuLoading, setIsMenuLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [error, setError] = useState('');

  const [selectedMenuId, setSelectedMenuId] = useState('');
  const [startDate, setStartDate] = useState(getDefaultStartDate());
  const [endDate, setEndDate] = useState(getDefaultEndDate());

  const [analysis, setAnalysis] = useState({
    total_reviews: 0,
    kept_reviews: 0,
    ignored_reviews: 0,
    total_complaints: 0,
    complaints_grouped: [],
  });

  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadMenuItems = async () => {
      try {
        setIsMenuLoading(true);
        setError('');
        const items = await getMenuProductsByRestaurant();
        if (!mounted) return;

        const normalized = Array.isArray(items) ? items : [];
        setMenuItems(normalized);

        if (normalized.length > 0) {
          const firstId = normalized[0].id || normalized[0]._id || '';
          setSelectedMenuId(firstId);
        }
      } catch (err) {
        if (!mounted) return;
        setError(err.message || 'Failed to load menu items');
      } finally {
        if (mounted) setIsMenuLoading(false);
      }
    };

    loadMenuItems();

    return () => {
      mounted = false;
    };
  }, []);

  const fetchAnalysis = async (menuId) => {
    if (!menuId) return;

    try {
      setAnalysisLoading(true);
      setError('');

      const payload = await getMenuReviewAnalysis(menuId, {
        startDate,
        endDate,
      });

      setAnalysis({
        total_reviews: payload?.total_reviews || 0,
        kept_reviews: payload?.kept_reviews || 0,
        ignored_reviews: payload?.ignored_reviews || 0,
        total_complaints: payload?.total_complaints || 0,
        complaints_grouped: Array.isArray(payload?.complaints_grouped)
          ? payload.complaints_grouped
          : [],
      });
    } catch (err) {
      setError(err.message || 'Failed to fetch review analysis');
      setAnalysis({
        total_reviews: 0,
        kept_reviews: 0,
        ignored_reviews: 0,
        total_complaints: 0,
        complaints_grouped: [],
      });
    } finally {
      setAnalysisLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedMenuId) return;
    fetchAnalysis(selectedMenuId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMenuId]);

  const categoryTotals = useMemo(() => {
    const totalsMap = new Map();

    analysis.complaints_grouped.forEach((group) => {
      const issues = Array.isArray(group?.issues) ? group.issues : [];
      issues.forEach((entry) => {
        const category = String(entry?.category || 'uncategorized').trim();
        const count = Number(entry?.count || 0);
        totalsMap.set(category, (totalsMap.get(category) || 0) + count);
      });
    });

    return Array.from(totalsMap.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  }, [analysis]);

  useEffect(() => {
    if (categoryTotals.length === 0) {
      setSelectedCategory('');
      return;
    }

    const hasSelected = categoryTotals.some(
      (item) => item.category === selectedCategory
    );

    if (!hasSelected) {
      setSelectedCategory(categoryTotals[0].category);
    }
  }, [categoryTotals, selectedCategory]);

  const issueChartData = useMemo(() => {
    if (!selectedCategory) return [];

    const issueMap = new Map();

    analysis.complaints_grouped.forEach((group) => {
      const issues = Array.isArray(group?.issues) ? group.issues : [];
      issues.forEach((entry) => {
        const category = String(entry?.category || '').trim();
        if (category !== selectedCategory) return;

        const issueLabel = String(entry?.issue || 'Unknown issue').trim();
        const key = issueLabel.toLowerCase();
        const count = Number(entry?.count || 0);

        if (!issueMap.has(key)) {
          issueMap.set(key, { issue: issueLabel, count: 0 });
        }

        const current = issueMap.get(key);
        current.count += count;
      });
    });

    return Array.from(issueMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);
  }, [analysis, selectedCategory]);

  const keptRate =
    analysis.total_reviews > 0
      ? Math.round((analysis.kept_reviews / analysis.total_reviews) * 100)
      : 0;

  const chartHeight = Math.max(160, issueChartData.length * 32);

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6 md:p-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#FF4D4F] to-[#FF7F7F] bg-clip-text text-transparent">
          Review Analyzer
        </h1>
        <p className="text-sm text-slate-600">
          Select a menu item to inspect complaints grouped from customer reviews.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2 space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Menu Item
            </label>
            <select
              value={selectedMenuId}
              onChange={(e) => setSelectedMenuId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-red-200"
              disabled={isMenuLoading || menuItems.length === 0}
            >
              {menuItems.length === 0 ? (
                <option value="">No menu items found</option>
              ) : (
                menuItems.map((item) => {
                  const id = item.id || item._id;
                  const label = item.productTitle || item.name || 'Untitled item';
                  return (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  );
                })
              )}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-red-200"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-red-200"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => fetchAnalysis(selectedMenuId)}
            disabled={!selectedMenuId || analysisLoading}
            className="rounded-lg bg-gradient-to-r from-[#FF4D4F] to-[#FF7F7F] px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
          >
            {analysisLoading ? 'Analyzing...' : 'Analyze Reviews'}
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Reviews" value={analysis.total_reviews} />
        <StatCard
          label="Kept Reviews"
          value={analysis.kept_reviews}
          helper={`${keptRate}% kept`}
        />
        <StatCard label="Ignored Reviews" value={analysis.ignored_reviews} />
        <StatCard
          label="Total Complaints"
          value={analysis.total_complaints}
          highlight
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          {categoryTotals.length === 0 ? (
            <p className="text-sm text-slate-500">No categorized complaints for this menu item in the selected range.</p>
          ) : (
            categoryTotals.map((item) => (
              <button
                key={item.category}
                type="button"
                onClick={() => setSelectedCategory(item.category)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  selectedCategory === item.category
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                }`}
              >
                {item.category} ({item.count})
              </button>
            ))
          )}
        </div>

        {selectedCategory && issueChartData.length > 0 ? (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              Top Issues in {selectedCategory}
            </h2>
            <div style={{ width: '100%', height: chartHeight }}>
              <ResponsiveContainer>
                <BarChart
                  data={issueChartData}
                  layout="vertical"
                  margin={{ top: 8, right: 24, left: 24, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                  <XAxis type="number" tickLine={false} axisLine={false} />
                  <YAxis
                    type="category"
                    dataKey="issue"
                    width={150}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(value) => [`${value}`, 'Complaints']}
                    contentStyle={{
                      borderRadius: '10px',
                      border: '1px solid #e5e7eb',
                    }}
                  />
                  <Bar dataKey="count" barSize={22} fill="#C3110C" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            No issue-level data to chart for the selected category.
          </div>
        )}
      </div>
    </section>
  );
}

function StatCard({ label, value, helper, highlight = false }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${highlight ? 'text-[#C3110C]' : 'text-slate-900'}`}>
        {Number(value || 0).toLocaleString()}
      </p>
      {helper && <p className="mt-1 text-xs text-slate-500">{helper}</p>}
    </article>
  );
}

export default Reviews;
