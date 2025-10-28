import React, { useState, useEffect } from 'react';
import { Building2, DollarSign, Star, CheckCircle, AlertCircle } from 'lucide-react';
import { QuizData, ClinicPrice } from '../types';
import { fetchClinicPrices } from '../utils/googleSheets';
import ContactForm from './ContactForm';

interface Step3Props {
  data: QuizData;
  onBack: () => void;
  onRestart: () => void;
}

const Step3: React.FC<Step3Props> = ({ data, onBack, onRestart }) => {
  const [clinics, setClinics] = useState<{ [key: string]: ClinicPrice }>({});
  const [loading, setLoading] = useState(true);
  const [selectedClinic, setSelectedClinic] = useState<string>('');
  const [showContactForm, setShowContactForm] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    const loadPrices = async () => {
      try {
        const prices = await fetchClinicPrices();
        setClinics(prices);
      } catch (error) {
        console.error('Failed to load prices:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPrices();
  }, []);

  const handleContactSubmit = (success: boolean) => {
    setFormSubmitted(true);
    if (success) {
      setTimeout(() => {
        setShowContactForm(false);
        setFormSubmitted(false);
        setSelectedClinic('');
      }, 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading clinic prices...</p>
        </div>
      </div>
    );
  }

  if (showContactForm && selectedClinic && clinics[selectedClinic]) {
    return (
      <div className="max-w-2xl mx-auto">
        {formSubmitted ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-green-800 mb-2">Message Sent Successfully!</h3>
            <p className="text-green-700">The clinic will contact you shortly to schedule your appointment.</p>
          </div>
        ) : (
          <ContactForm
            selectedClinic={clinics[selectedClinic]}
            onSubmit={handleContactSubmit}
          />
        )}
        
        <div className="text-center mt-6">
          <button
            onClick={() => {
              setShowContactForm(false);
              setSelectedClinic('');
            }}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Results
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mx-auto mb-4">
          <Building2 className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Your Personalized Results</h2>
        <div className="bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-blue-800">
            <strong>{data.gender === 'male' ? 'Male' : 'Female'}</strong> • 
            <strong> {data.age} years</strong> • 
            <strong> {data.examinationType === 'full' ? 'Comprehensive' : 'Regular'} Exam</strong>
          </p>
        </div>
      </div>

      {Object.keys(clinics).length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Unable to Load Clinic Data</h3>
          <p className="text-gray-600">Please try again later or contact support.</p>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {Object.entries(clinics).map(([key, clinic]) => {
              const price = data.examinationType === 'full' ? clinic.fullExamPrice : clinic.regularExamPrice;
              const savings = key === 'onClinic' && clinics.sanaVita ? 
                (data.examinationType === 'full' ? clinics.sanaVita.fullExamPrice - price : clinics.sanaVita.regularExamPrice - price) : 
                (clinics.onClinic ? price - (data.examinationType === 'full' ? clinics.onClinic.fullExamPrice : clinics.onClinic.regularExamPrice) : 0);
              
              return (
                <div
                  key={key}
                  className={`bg-white rounded-2xl shadow-xl p-8 border-2 hover:shadow-2xl transition-all duration-300 ${
                    key === 'onClinic' ? 'border-blue-200 ring-2 ring-blue-100' : 'border-gray-200'
                  }`}
                >
                  {key === 'onClinic' && (
                    <div className="bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-lg px-3 py-1 text-sm font-semibold w-fit mb-4 flex items-center">
                      <Star className="w-4 h-4 mr-1" />
                      RECOMMENDED
                    </div>
                  )}
                  
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{clinic.clinic}</h3>
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      ${price.toLocaleString()}
                    </div>
                    <p className="text-gray-600">
                      {data.examinationType === 'full' ? 'Comprehensive' : 'Regular'} Examination
                    </p>
                    {savings > 0 && key === 'onClinic' && (
                      <div className="bg-green-100 text-green-800 rounded-full px-3 py-1 text-sm font-medium inline-block mt-2">
                        Save ${savings.toLocaleString()}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium">{clinic.contact.phone}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{clinic.contact.email}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Address:</span>
                      <p className="font-medium mt-1">{clinic.contact.address}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedClinic(key);
                      setShowContactForm(true);
                    }}
                    className={`w-full py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center justify-center space-x-2 ${
                      key === 'onClinic'
                        ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white hover:from-blue-700 hover:to-teal-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <DollarSign className="w-5 h-5" />
                    <span>Book Appointment</span>
                  </button>
                </div>
              );
            })}
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Important Information</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Prices include all tests and consultation fees</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Results typically available within 3-5 business days</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Follow-up consultation included in the package</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Flexible scheduling available</span>
              </li>
            </ul>
          </div>
        </>
      )}

      <div className="flex justify-between mt-12">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-600 font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
        >
          Back
        </button>
        
        <button
          onClick={onRestart}
          className="px-8 py-4 rounded-lg font-semibold text-lg bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800 transition-all duration-300"
        >
          Start New Assessment
        </button>
      </div>
    </div>
  );
};

export default Step3;