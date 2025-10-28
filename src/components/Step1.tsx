import React from 'react';
import { User, Calendar } from 'lucide-react';
import { QuizData } from '../types';

interface Step1Props {
  data: QuizData;
  onUpdate: (data: Partial<QuizData>) => void;
  onNext: () => void;
}

const Step1: React.FC<Step1Props> = ({ data, onUpdate, onNext }) => {
  const ageRanges = [
    '18-25', '26-35', '36-45', '46-55', '56-65', '65+'
  ];

  const canProceed = data.gender && data.age;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full mx-auto mb-4">
          <User className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Personal Information</h2>
        <p className="text-gray-600">Let us know a bit about you to customize your health screening recommendations</p>
      </div>

      <div className="space-y-8">
        {/* Gender Selection */}
        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-4">Gender</label>
          <div className="grid grid-cols-2 gap-4">
            {['male', 'female'].map((gender) => (
              <button
                key={gender}
                onClick={() => onUpdate({ gender: gender as 'male' | 'female' })}
                className={`p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                  data.gender === gender
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <div className="text-center">
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                    data.gender === gender ? 'bg-blue-500' : 'bg-gray-400'
                  }`}>
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <span className="font-semibold capitalize text-gray-800">{gender}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Age Selection */}
        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-4">Age Range</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {ageRanges.map((age) => (
              <button
                key={age}
                onClick={() => onUpdate({ age })}
                className={`p-4 rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
                  data.age === age
                    ? 'border-teal-500 bg-teal-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-teal-300 hover:bg-teal-50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Calendar className={`w-5 h-5 ${data.age === age ? 'text-teal-600' : 'text-gray-500'}`} />
                  <span className="font-semibold text-gray-800">{age}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12 text-center">
        <button
          onClick={onNext}
          disabled={!canProceed}
          className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 ${
            canProceed
              ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white hover:from-blue-700 hover:to-teal-700 shadow-lg hover:shadow-xl transform hover:scale-105'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continue to Examination Options
        </button>
      </div>
    </div>
  );
};

export default Step1;