import { useState } from "react";
import { 
  AlertCircle, 
  CheckCircle2, 
  Shield, 
  Star, 
  MessageSquare,
  FileCheck,
  DollarSign,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PainPoint {
  id: number;
  problemIcon: React.ElementType;
  problemTitle: string;
  problemShortText: string;
  solutionIcon: React.ElementType;
  solutionTitle: string;
  solutionPoints: string[];
  detailedContent?: React.ReactNode;
  ctaButton?: {
    text: string;
    link: string;
  };
}

const painPointsData: PainPoint[] = [
  {
    id: 1,
    problemIcon: AlertCircle,
    problemTitle: "Не знаете, кому доверить груз?",
    problemShortText: "Все компании говорят, что они лучшие...",
    solutionIcon: Star,
    solutionTitle: "120+ реальных отзывов в Яндексе",
    solutionPoints: [
      "Более 120 отзывов от реальных клиентов",
      "Можно написать клиентам и узнать их мнение",
      "Проверенная репутация на Яндекс.Картах"
    ],
    detailedContent: (
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
          <MessageSquare className="w-6 h-6 text-[#083cb5] flex-shrink-0 mt-1" />
          <div>
            <h5 className="font-semibold text-gray-800 mb-2">Проверить легко!</h5>
            <p className="text-sm text-gray-700">
              В Яндекс.Отзывах можно написать любому клиенту напрямую и спросить, 
              как проходило сотрудничество с нашей компанией. Это реальные люди с реальным опытом!
            </p>
          </div>
        </div>
      </div>
    ),
    ctaButton: {
      text: "Читать отзывы на Яндекс",
      link: "https://yandex.ru/maps/org/norda/1288448268/reviews/"
    }
  },
  {
    id: 2,
    problemIcon: Package,
    problemTitle: "Боитесь за сохранность груза?",
    problemShortText: "Опасаетесь, что груз повредят или потеряют...",
    solutionIcon: Shield,
    solutionTitle: "Полная ответственность в договоре",
    solutionPoints: [
      "Груз застрахован в договоре",
      "Чёткий пункт об ответственности",
      "Компенсация в случае инцидентов"
    ],
    detailedContent: (
      <div className="space-y-4">
        <Tabs defaultValue="competitors" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="competitors">Конкуренты</TabsTrigger>
            <TabsTrigger value="us">Мы</TabsTrigger>
          </TabsList>
          
          <TabsContent value="competitors" className="mt-4">
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
                <h5 className="font-bold text-red-900">Большинство не несут ответственность!</h5>
              </div>
              <p className="text-sm text-red-700 mb-3">
                Многие компании прямо говорят, что не отвечают за груз:
              </p>
              <div className="bg-white rounded p-3 border-l-4 border-red-400">
                <p className="text-xs font-semibold text-gray-700 mb-1">Грузовичкоф.ru (лидер рынка):</p>
                <p className="text-xs italic text-gray-600">
                  "Мы не несём материальную ответственность за зеркала и стеклянные предметы"
                </p>
              </div>
              <p className="text-xs text-red-600 mt-3 font-medium">
                ⚠️ Всегда запрашивайте договор перед работой!
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="us" className="mt-4">
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-3">
                <FileCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                <h5 className="font-bold text-green-900">У нас всё по-честному!</h5>
              </div>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-green-700">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Полное страхование груза в договоре</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-green-700">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Прописана материальная ответственность</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-green-700">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Компенсация при любых повреждениях</span>
                </li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    ),
    ctaButton: {
      text: "Скачать образец договора",
      link: "#"
    }
  },
  {
    id: 3,
    problemIcon: DollarSign,
    problemTitle: "100% предоплата и бесконечные переносы?",
    problemShortText: "Берут всю оплату, а потом переносят день за днём...",
    solutionIcon: CheckCircle2,
    solutionTitle: "Честная схема 50/50",
    solutionPoints: [
      "Только 50% предоплаты",
      "Остальное — после доставки",
      "Вы платите за результат"
    ],
    detailedContent: (
      <div className="space-y-4">
        {/* Визуальная схема оплаты */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6">
          <h5 className="text-center font-bold text-gray-800 mb-4">
            Как работает оплата
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 50% при заказе */}
            <div className="relative">
              <div className="bg-white border-4 border-[#083cb5] rounded-xl p-6 text-center shadow-lg hover:scale-105 transition-transform">
                <div className="text-5xl font-black text-[#083cb5] mb-3">50%</div>
                <div className="h-1 w-20 bg-[#083cb5] mx-auto mb-3 rounded"></div>
                <p className="font-bold text-gray-800 mb-2">При заказе</p>
                <p className="text-xs text-gray-600">
                  Подтверждаем вашу заявку и начинаем работу
                </p>
              </div>
              {/* Стрелка */}
              <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                <div className="text-4xl text-[#083cb5]">→</div>
              </div>
            </div>
            
            {/* 50% после доставки */}
            <div>
              <div className="bg-white border-4 border-green-500 rounded-xl p-6 text-center shadow-lg hover:scale-105 transition-transform">
                <div className="text-5xl font-black text-green-600 mb-3">50%</div>
                <div className="h-1 w-20 bg-green-500 mx-auto mb-3 rounded"></div>
                <p className="font-bold text-gray-800 mb-2">После доставки</p>
                <p className="text-xs text-gray-600">
                  Груз доставлен целым и вовремя — доплачиваете остаток
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Примечание */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-xs text-yellow-800 text-center">
            <strong>*</strong> Условие действует для физических лиц и наших постоянных клиентов
          </p>
        </div>
      </div>
    )
  }
];

export const ClientPainPoints = () => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <section className="w-full py-16 bg-background">
      <div className="container mx-auto px-6">
        {/* Заголовок секции */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4" style={{ color: '#083cb5' }}>
            Мы решаем ваши страхи и опасения
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Честно о том, что вас беспокоит при выборе грузоперевозчика, 
            и как мы с этим справляемся
          </p>
        </div>

        {/* Аккордеон карточки */}
        <div className="space-y-4 max-w-4xl mx-auto">
          {painPointsData.map((point) => {
            const isExpanded = expandedId === point.id;
            const ProblemIcon = point.problemIcon;
            const SolutionIcon = point.solutionIcon;

            return (
              <div
                key={point.id}
                className={`
                  bg-white rounded-2xl shadow-md overflow-hidden 
                  transition-all duration-300 border-2
                  ${isExpanded 
                    ? 'border-[#083cb5] shadow-xl' 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
                  }
                `}
              >
                {/* Заголовок - всегда видимый */}
                <button
                  onClick={() => toggleExpand(point.id)}
                  className="w-full p-6 text-left transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Иконка проблемы */}
                      <div className={`
                        flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center
                        ${isExpanded ? 'bg-red-100' : 'bg-gray-100'}
                        transition-colors
                      `}>
                        <ProblemIcon className={`
                          w-7 h-7 
                          ${isExpanded ? 'text-red-600' : 'text-gray-600'}
                          transition-colors
                        `} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">
                            ПРОБЛЕМА #{point.id}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {point.problemTitle}
                        </h3>
                        {!isExpanded && (
                          <p className="text-sm text-gray-500">
                            {point.problemShortText}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Кнопка раскрытия */}
                    <div className={`
                      flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                      transition-all
                      ${isExpanded ? 'bg-[#083cb5] text-white' : 'bg-gray-100 text-gray-600'}
                    `}>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Развернутый контент - Решение */}
                {isExpanded && (
                  <div className="border-t-2 border-gray-100">
                    {/* Решение */}
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="flex-shrink-0 w-14 h-14 bg-[#083cb5] rounded-full flex items-center justify-center">
                          <SolutionIcon className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded">
                            ✅ НАШЕ РЕШЕНИЕ
                          </span>
                          <h4 className="text-2xl font-bold text-gray-900 mt-2 mb-3">
                            {point.solutionTitle}
                          </h4>
                          <ul className="space-y-2">
                            {point.solutionPoints.map((bullet, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-gray-700">
                                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <span className="text-sm">{bullet}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      {/* Детальный контент */}
                      {point.detailedContent && (
                        <div className="mt-4">
                          {point.detailedContent}
                        </div>
                      )}
                      
                      {/* Кнопка действия */}
                      {point.ctaButton && (
                        <div className="mt-6 flex justify-center">
                          <Button
                            onClick={() => window.open(point.ctaButton!.link, '_blank')}
                            className="gap-2 px-8"
                            size="lg"
                            style={{ backgroundColor: '#083cb5' }}
                          >
                            {point.ctaButton.text}
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
