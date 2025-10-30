import { ArrowUpRight, GripVertical } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const data = [
  { month: "Jan", sales: 6000000, trend: 4500000 },
  { month: "Feb", sales: 4500000, trend: 4500000 },
  { month: "Mar", sales: 4500000, trend: 3500000 },
  { month: "Apr", sales: 7000000, trend: 5000000 },
  { month: "May", sales: 9988093, trend: 6000000 },
  { month: "Jun", sales: 7000000, trend: 5500000 },
];

const ChartCard = () => {
  return (
    <div className="bg-primary text-primary-foreground rounded-[40px] p-8 relative overflow-hidden">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-3xl font-bold mb-2">Total Sales</h3>
          <p className="text-sm opacity-80 max-w-xl">
            The overall revenue generated from product sales, offering a comprehensive view of your supermarket's financial performance.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:scale-110">
            <GripVertical className="w-5 h-5" />
          </button>
          <button className="w-12 h-12 rounded-full bg-white text-primary hover:bg-white/90 flex items-center justify-center transition-all hover:scale-110">
            <ArrowUpRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="inline-block bg-white text-primary px-8 py-4 rounded-full text-2xl font-bold mb-8 shadow-lg">
        $9 988 093
      </div>
      
      <div className="h-64 -mx-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="white" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="white" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="month" 
              stroke="rgba(255,255,255,0.6)" 
              tick={{ fill: 'rgba(255,255,255,0.8)' }}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.6)" 
              tick={{ fill: 'rgba(255,255,255,0.8)' }}
              tickFormatter={(value) => `${(value / 1000000).toFixed(1)}m`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255,255,255,0.95)', 
                border: 'none',
                borderRadius: '12px',
                color: '#1a1a1a'
              }}
              formatter={(value: number) => [`$${(value / 1000000).toFixed(2)}m`, 'Sales']}
            />
            <Area 
              type="monotone" 
              dataKey="trend" 
              stroke="rgba(255,255,255,0.5)" 
              strokeWidth={2}
              fill="none"
              strokeDasharray="5 5"
            />
            <Area 
              type="monotone" 
              dataKey="sales" 
              stroke="white" 
              strokeWidth={3}
              fill="url(#salesGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartCard;
