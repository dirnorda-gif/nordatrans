import { Users } from "lucide-react";
import { StatCard } from "@/components/StatCard";

const Test = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-8 text-gray-700">
          Тестовая страница - Визуальный блок
        </h1>
        
        {/* Одна карточка для работы над дизайном */}
        <StatCard
          title="Довольных клиентов"
          value="9,998"
          suffix="+"
          trend={{
            value: 15,
            isPositive: true,
          }}
          icon={Users}
          gradient={{
            from: "#083cb5",
            to: "#405b9a",
          }}
          maskColor="#f9fafb"
        />
      </div>
    </div>
  );
};

export default Test;

