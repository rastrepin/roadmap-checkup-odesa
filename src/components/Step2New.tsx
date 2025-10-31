import React, { useState } from 'react';
import { Heart, Activity, MessageSquare, CheckCircle, X, ChevronRight } from 'lucide-react';
import { QuizData } from '../types';

interface Step2Props {
  data: QuizData;
  onUpdate: (data: Partial<QuizData>) => void;
  onNext: () => void;
  onBack: () => void;
}

interface ExamType {
  id: 'full' | 'regular' | 'individual';
  title: string;
  badge?: string;
  description: string;
  benefits: string[];
  forWho: string;
  icon: React.ReactNode;
  priority: 1 | 2 | 3;
  hasDetails: boolean;
  highlight?: string;
}

const Step2: React.FC<Step2Props> = ({ data, onUpdate, onNext, onBack }) => {
  const [showModal, setShowModal] = useState<'full' | 'regular' | null>(null);

  const examTypes: ExamType[] = [
    {
      id: 'full',
      title: 'Повне обстеження',
      badge: '💎 Обирають 7 з 10',
      description: 'Дізнайтесь про стан здоров\'я всіх систем організму. 15-20 досліджень для повної картини вашого здоров\'я.',
      benefits: [
        'Всі системи організму',
        'Результати за 3-5 днів',
        'Консультація терапевта включена'
      ],
      forWho: 'Для тих, хто цінує здоров\'я та хоче знати все',
      icon: <Heart className="w-8 h-8" />,
      priority: 1,
      hasDetails: true
    },
    {
      id: 'regular',
      title: 'Регулярне обстеження',
      badge: '2 етапи',
      description: 'Спочатку базові аналізи, потім персоналізована програма. Для тих, хто проходить чекап щороку.',
      benefits: [
        '8-12 ключових досліджень',
        'Індивідуальний підбір на 2 етапі',
        'Економія до 30%'
      ],
      forWho: 'Якщо проходили повний чекап нещодавно',
      icon: <Activity className="w-8 h-8" />,
      priority: 2,
      hasDetails: true,
      highlight: '💡 2 етапи: базове + те, що призначить лікар'
    },
    {
      id: 'individual',
      title: 'Індивідуальна програма',
      badge: 'З менеджером',
      description: 'Менеджер допоможе підібрати програму під ваші потреби. Безкоштовна консультація.',
      benefits: [
        'Персональний підбір',
        'Врахування всіх побажань'
      ],
      forWho: 'Якщо є конкретні скарги або не впевнені у виборі',
      icon: <MessageSquare className="w-8 h-8" />,
      priority: 3,
      hasDetails: false
    }
  ];

  const handleSelectExam = (examId: 'full' | 'regular' | 'individual') => {
    onUpdate({ examType: examId });
    onNext();
  };

  const getCardStyles = (priority: number) => {
    switch (priority) {
      case 1:
        return 'border-2 border-blue-500 bg-blue-50/50 shadow-lg hover:shadow-xl p-5 md:p-6 transform hover:scale-[1.02]';
      case 2:
        return 'border border-gray-300 bg-white shadow-md hover:shadow-lg p-4 md:p-5';
      case 3:
        return 'border border-gray-200 bg-gray-50 shadow-sm hover:shadow-md p-4 md:p-5';
      default:
        return '';
    }
  };

  const DetailsModal = ({ examId }: { examId: 'full' | 'regular' }) => {
    const modalContent = {
      full: {
        title: 'Що входить у Повне обстеження',
        subtitle: 'Комплексна діагностика всіх систем організму за 1-2 візити',
        systems: [
          {
            icon: '🫀',
            name: 'Серце та судини',
            tests: ['ЕКГ з розшифровкою', 'Холестерин та ліпідограма']
          },
          {
            icon: '🫁',
            name: 'Дихальна система',
            tests: ['Рентген грудної клітки', 'Спірометрія']
          },
          {
            icon: '🧬',
            name: 'Ендокринна система',
            tests: ['Гормони щитовидки (ТТГ, Т4)', 'Глюкоза крові']
          },
          {
            icon: '📋',
            name: 'Загальні показники',
            tests: ['Загальний аналіз крові', 'Біохімія (7 показників)']
          }
        ],
        howItWorks: [
          'Запис на зручний час',
          'Візит до клініки (2-3 години)',
          'Результати на email за 3-5 днів',
          'Консультація терапевта'
        ]
      },
      regular: {
        title: 'Що входить у Регулярне обстеження',
        subtitle: 'Базова перевірка ключових показників з можливістю персоналізації',
        systems: [
          {
            icon: '🫀',
            name: 'Серце та судини',
            tests: ['ЕКГ', 'Холестерин']
          },
          {
            icon: '🧬',
            name: 'Ендокринна система',
            tests: ['ТТГ', 'Глюкоза']
          },
          {
            icon: '📋',
            name: 'Загальні показники',
            tests: ['Загальний аналіз крові', 'Базова біохімія']
          }
        ],
        howItWorks: [
          'Етап 1: Базові аналізи (8-12 досліджень)',
          'Консультація терапевта',
          'Етап 2: Додаткові дослідження за призначенням',
          'Повні рекомендації'
        ]
      }
    };

    const content = modalContent[examId];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 md:p-6 flex items-start justify-between">
            <div className="flex-1 pr-4">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                {content.title}
              </h3>
              <p className="text-sm md:text-base text-gray-600">
                {content.subtitle}
              </p>
            </div>
            <button
              onClick={() => setShowModal(null)}
              className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 md:p-6 space-y-6">
            {/* Секція 1: Дослідження за системами */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Дослідження за системами
              </h4>
              <div className="space-y-4">
                {content.systems.map((system, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0">{system.icon}</span>
                      <div className="flex-1">
                        <h5 className="font-semibold text-gray-900 mb-2">
                          {system.name}
                        </h5>
                        <ul className="space-y-1">
                          {system.tests.map((test, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                              <span className="text-blue-500 mt-1">•</span>
                              <span>{test}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Секція 2: Як проходить */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Як проходить обстеження
              </h4>
              <div className="space-y-3">
                {content.howItWorks.map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                      {index + 1}
                    </div>
                    <p className="text-gray-700 pt-1">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 md:p-6 flex gap-3">
            <button
              onClick={() => setShowModal(null)}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Закрити
            </button>
            <button
              onClick={() => {
                handleSelectExam(examId);
                setShowModal(null);
              }}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Обрати програму
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
          Оберіть тип обстеження
        </h2>
        <p className="text-base md:text-lg text-gray-600">
          Оберіть програму яка найкраще відповідає вашим потребам
        </p>
      </div>

      {/* Exam Type Cards */}
      <div className="space-y-4 mb-8">
        {examTypes.map((exam) => (
          <div
            key={exam.id}
            className={`rounded-xl transition-all duration-200 ${getCardStyles(exam.priority)}`}
          >
            {/* Card Header */}
            <div className="flex items-start gap-4 mb-4">
              <div className={`flex-shrink-0 p-3 rounded-xl ${
                exam.priority === 1 ? 'bg-blue-100 text-blue-600' :
                exam.priority === 2 ? 'bg-teal-100 text-teal-600' :
                'bg-gray-200 text-gray-600'
              }`}>
                {exam.icon}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                    {exam.title}
                  </h3>
                  {exam.badge && (
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      exam.priority === 1 ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white' :
                      exam.priority === 2 ? 'bg-teal-100 text-teal-700' :
                      'bg-gray-200 text-gray-700'
                    }`}>
                      {exam.badge}
                    </span>
                  )}
                </div>
                <p className="text-sm md:text-base text-gray-600 mb-3">
                  {exam.description}
                </p>
              </div>
            </div>

            {/* Benefits */}
            <div className="mb-4 space-y-2">
              {exam.benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm md:text-base text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Highlight */}
            {exam.highlight && (
              <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">{exam.highlight}</p>
              </div>
            )}

            {/* For Who */}
            <div className="mb-4 text-sm text-gray-500">
              {exam.forWho}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => handleSelectExam(exam.id)}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 ${
                  exam.priority === 1
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : exam.priority === 2
                    ? 'bg-teal-600 text-white hover:bg-teal-700'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                {exam.id === 'individual' ? 'Отримати консультацію' : `Обрати ${exam.title.toLowerCase()}`}
                <ChevronRight className="w-5 h-5" />
              </button>

              {exam.hasDetails && (
                <button
                  onClick={() => setShowModal(exam.id as 'full' | 'regular')}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Детальніше
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 py-3 px-6 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
        >
          Назад
        </button>
      </div>

      {/* Modal */}
      {showModal && <DetailsModal examId={showModal} />}
    </div>
  );
};

export default Step2;
