import React from 'react';
import { Heart, Activity, Stethoscope, CheckCircle } from 'lucide-react';
import { QuizData } from '../types';

interface Step2Props {
  data: QuizData;
  onUpdate: (data: Partial<QuizData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const Step2: React.FC<Step2Props> = ({ data, onUpdate, onNext, onBack }) => {
  const examTypes = [
    {
      id: 'regular',
      title: 'Regular Check-up',
      icon: Stethoscope,
      description: 'Basic health screening with essential tests',
      features: [
        'Blood pressure check',
        'Basic blood work',
        'General physical exam',
        'BMI assessment',
        'Health consultation'
      ],
      duration: '1-2 hours',
      recommended: 'Annual screening'
    },
    {
      id: 'full',
      title: 'Comprehensive Exam',
      icon: Heart,
      description: 'Complete health assessment with advanced diagnostics',
      features: [
        'Everything in Regular Check-up',
        'Advanced blood panel',
        'ECG & heart monitoring',
        'Cancer screening tests',
        'Detailed specialist consultation',
        'Nutritional assessment',
        'Mental health screening'
      ],
      duration: '3-4 hours',
      recommended: 'Every 2-3 years or as advised'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full mx-auto mb-4">
          <Activity className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Choose Your Examination Type</h2>
        <p className="text-gray-600">Select the health screening that best fits your needs</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {examTypes.map((exam) => {
          const Icon = exam.icon;
          const isSelected = data.examinationType === exam.id;
          
          return (
            <button
              key={exam.id}
              onClick={() => onUpdate({ examinationType: exam.id as 'full' | 'regular' })}
              className={`p-8 rounded-2xl border-2 text-left transition-all duration-300 hover:scale-105 ${
                isSelected
                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-teal-50 shadow-xl'
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg'
              }`}
            >
              <div className="flex items-center mb-6">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                  isSelected ? 'bg-blue-500' : 'bg-gray-400'
                }`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{exam.title}</h3>
                  <p className="text-gray-600">{exam.description}</p>
                </div>
                {isSelected && (
                  <CheckCircle className="w-8 h-8 text-blue-500 ml-auto" />
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Includes:</h4>
                  <ul className="space-y-1">
                    {exam.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-teal-500 rounded-full mr-2"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex justify-between text-sm">
                  <div>
                    <span className="text-gray-500">Duration:</span>
                    <span className="font-semibold text-gray-700 ml-1">{exam.duration}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Recommended:</span>
                    <span className="font-semibold text-gray-700 ml-1">{exam.recommended}</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-between mt-12">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-600 font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
        >
          Back
        </button>
        
        <button
          onClick={onNext}
          disabled={!data.examinationType}
          className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 ${
            data.examinationType
              ? 'bg-gradient-to-r from-teal-600 to-blue-600 text-white hover:from-teal-700 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          View Pricing & Clinics
        </button>
      </div>
    </div>
  );
};

export default Step2;