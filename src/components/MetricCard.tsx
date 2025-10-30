import { ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  unit?: string;
  variant?: "primary" | "secondary" | "accent";
  className?: string;
}

const MetricCard = ({ title, value, change, unit = "", variant = "primary", className }: MetricCardProps) => {
  const isPositive = change >= 0;
  
  const variantClasses = {
    primary: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    accent: "bg-accent text-accent-foreground",
  };

  return (
    <div className={cn("relative rounded-[40px] p-8 transition-transform hover:scale-[1.02]", variantClasses[variant], className)}>
      <button className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:scale-110">
        <ArrowUpRight className="w-5 h-5" />
      </button>
      
      <h3 className="text-sm font-medium mb-4 opacity-90">{title}</h3>
      
      <div className="flex items-baseline gap-2">
        <span className="text-5xl font-bold">{value}</span>
        {unit && <span className="text-2xl opacity-80">{unit}</span>}
      </div>
      
      <div className="flex items-center gap-1 mt-3">
        {isPositive ? (
          <TrendingUp className="w-4 h-4 text-success" />
        ) : (
          <TrendingDown className="w-4 h-4 text-destructive" />
        )}
        <span className={cn("text-sm font-medium", isPositive ? "text-success" : "text-destructive")}>
          {isPositive ? "+" : ""}{change}%
        </span>
      </div>
    </div>
  );
};

export default MetricCard;
