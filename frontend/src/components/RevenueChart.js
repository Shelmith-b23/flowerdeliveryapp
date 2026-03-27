// src/components/RevenueChart.js
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function RevenueChart({ orders }) {
  // Process orders into chart data (Group by date)
  const chartData = orders.reduce((acc, order) => {
    const date = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const existing = acc.find(item => item.date === date);
    if (existing) {
      existing.revenue += Number(order.total_price || 0);
    } else {
      acc.push({ date, revenue: Number(order.total_price || 0) });
    }
    return acc;
  }, []).slice(-7); // Show last 7 days of activity

  return (
    <div className="revenue-chart-wrapper" style={{ height: '300px', width: '100%', marginTop: '30px' }}>
      <span className="text-uppercase" style={{ marginBottom: '20px', display: 'block' }}>Revenue Trend (Last 7 Days)</span>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8E8E8" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#717171' }} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#717171' }}
            tickFormatter={(value) => `KSh ${value}`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#FFF', border: '1px solid #1A1A1A', fontSize: '12px' }}
            itemStyle={{ color: '#1A1A1A' }}
          />
          <Line 
            type="monotone" 
            dataKey="revenue" 
            stroke="#1A1A1A" 
            strokeWidth={2} 
            dot={{ r: 4, fill: '#1A1A1A' }} 
            activeDot={{ r: 6 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}