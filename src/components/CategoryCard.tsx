import { LucideIcon } from "lucide-react";

interface CategoryCardProps {
  icon: LucideIcon;
  category: string;
  value: string;
  unit?: string;
}

const CategoryCard = ({ icon: Icon, category, value, unit = "$" }: CategoryCardProps) => {
  return (
    <div className="flex flex-col items-center text-center p-6 rounded-3xl hover:bg-muted/30 transition-all cursor-pointer group">
      <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all">
        <Icon className="w-8 h-8 text-primary" />
      </div>
      <h4 className="text-sm text-muted-foreground mb-2">{category}</h4>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold">{value}</span>
        <span className="text-sm text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
};

export default CategoryCard;
