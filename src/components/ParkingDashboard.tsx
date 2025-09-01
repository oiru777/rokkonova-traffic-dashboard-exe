import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import { useParkingData } from '../hooks/useApi';
import { ParkingData } from '../types';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

interface ParkingDashboardProps {
  selectedDate: string;
  csvData?: ParkingData[];
  isUsingCsv?: boolean;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const ParkingDashboard: React.FC<ParkingDashboardProps> = ({ selectedDate, csvData, isUsingCsv }) => {
  const { data, loading, error } = useParkingData(selectedDate, csvData, isUsingCsv);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={`駐車場データの取得に失敗しました: ${error}`} />;
  if (!data || data.length === 0) {
    return <ErrorMessage message="選択した日付の駐車場データがありません" />;
  }

  // Process data for charts
  const timeSeriesData = data.map(item => ({
    time: item.timestamp.split(' ')[1], // Extract time
    entry: item.entry_count,
    exit: item.exit_count,
    occupancy: item.occupancy_rate * 100, // Convert to percentage
  }));

  const regionData = data.reduce((acc, item) => {
    acc[item.plate_region] = (acc[item.plate_region] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const regionPieData = Object.entries(regionData).map(([region, count]) => ({
    name: region,
    value: count,
  }));

  // Group by hour for stay duration
  const hourlyStayData = data.reduce((acc, item) => {
    const hour = item.timestamp.split(' ')[1].split(':')[0];
    if (!acc[hour]) acc[hour] = { hour, totalDuration: 0, count: 0 };
    acc[hour].totalDuration += item.stay_duration;
    acc[hour].count += 1;
    return acc;
  }, {} as Record<string, { hour: string; totalDuration: number; count: number }>);

  const stayDurationData = Object.values(hourlyStayData).map(item => ({
    hour: `${item.hour}:00`,
    avgDuration: Math.round(item.totalDuration / item.count),
  }));

  return (
    <div className="space-y-8">
      {/* Parking Flow Chart */}
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">入庫・出庫数および満車率の推移</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeSeriesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              yAxisId="left" 
              tick={{ fontSize: 12 }}
              label={{ value: '台数', angle: -90, position: 'insideLeft' }}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              tick={{ fontSize: 12 }}
              label={{ value: '満車率 (%)', angle: 90, position: 'insideRight' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="entry"
              stroke="#3B82F6"
              strokeWidth={3}
              name="入庫数"
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="exit"
              stroke="#10B981"
              strokeWidth={3}
              name="出庫数"
              dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="occupancy"
              stroke="#F59E0B"
              strokeWidth={3}
              name="満車率 (%)"
              dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#F59E0B', strokeWidth: 2 }}
            />
          </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {/* Regional Distribution */}
        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">ナンバープレート地域別構成</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <Pie
                data={regionPieData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name}\n${(percent * 100).toFixed(1)}%`}
                outerRadius="80%"
                innerRadius="40%"
                fill="#8884d8"
                dataKey="value"
                stroke="#fff"
                strokeWidth={2}
              >
                {regionPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend />
            </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Average Stay Duration */}
        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">時間帯別平均滞在時間</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stayDurationData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="hour" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                label={{ value: '滞在時間 (分)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value) => [`${value}分`, '平均滞在時間']}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Bar 
                dataKey="avgDuration" 
                fill="#3B82F6" 
                radius={[4, 4, 0, 0]}
                stroke="#2563EB"
                strokeWidth={1}
              />
            </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParkingDashboard;