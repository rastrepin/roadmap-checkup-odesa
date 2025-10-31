import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, Heart, Activity, Users, MapPin, Phone, Clock, CheckCircle2, Star, AlertCircle, Send, Loader2 } from 'lucide-react';
import Step2 from './components/Step2';

// API конфігурація з реальними даними
const SHEET_ID = '1nZHWVu9pILQEFtZezgakZglzOlFF3a0G5VczH9o4TSE';
const API_PRICES_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=API_Export`;
const API_CLINICS_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Клініка_Дані`;
const API_PROGRAMS_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Програми_Описи`;

// Telegram конфігурація
const TELEGRAM_APPS = ['APP-ID-745344752', 'APP-ID-248929032'];

// Типи та інтерфейси
interface PriceData {
  female_onclinic: Record<string, number>;
  male_onclinic: Record<string, number>;
  female_sanavita: Record<string, number>;
  male_sanavita: Record<string, number>;
}

interface ClinicInfo {
  onclinic: {
    name: string;
    branches: Array<{name: string; address: string; hours: string}>;
    features: string;
    contact: string;
  };
  sanavita: {
    name: string;
    address: string;
    hours: string;
    features: string;
    contact: string;
  };
}

interface ProgramData {
  program_id: string;
  program_name: string;
  subtitle: string;
  short_description: string;
  key_directions: string;
  program_composition: string;
  preparation: string;
}

interface QuizData {
  gender: 'female' | 'male' | '';
  age: number;
  examType: 'full' | 'regular' | 'individual' | '';
  name: string;
  phone: string;
  email: string;
  preferredClinic: 'onclinic' | 'sanavita' | '';
  preferredDate1: string;
  preferredDate2: string;
  comments: string;
  requestType: 'standard' | 'extended' | 'individual' | 'specialist' | '';
  specialistType: string;
}

interface ProgramResult {
  program: string;
  onclinic: number;
  sanavita: number;
  programName: string;
  savings: number;
}

const RoadmapCheckup = () => {
  // 1. STATE DECLARATIONS
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<'loading' | 'success' | 'demo'>('loading');
  const [prices, setPrices] = useState<PriceData | null>(null);
  const [clinics, setClinics] = useState<ClinicInfo | null>(null);
  const [programs, setPrograms] = useState<ProgramData[]>([]);
  const [result, setResult] = useState<ProgramResult | null>(null);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showProgramDetails, setShowProgramDetails] = useState<'full' | 'regular' | null>(null);
  
  const [quizData, setQuizData] = useState<QuizData>({
    gender: '',
    age: 30,
    examType: '',
    name: '',
    phone: '',
    email: '',
    preferredClinic: '',
    preferredDate1: '',
    preferredDate2: '',
    comments: '',
    requestType: '',
    specialistType: ''
  });
// Функція визначення вікового діапазону
  const getAgeRange = (age: number): string => {
    if (age < 30) return '18-30';
    if (age < 40) return '30-40';
    if (age < 50) return '40-50';
    return '50+';
  };
  // 2. HELPER FUNCTIONS (правильний порядок)
  
  // Логіка вибору програми
  function selectProgram(gender: string, age: number, type: string): string {
    let ageGroup: string;
    if (age < 30) ageGroup = '20';
    else if (age < 40) ageGroup = '30'; 
    else if (age < 50) ageGroup = '40';
    else ageGroup = '50';
    
    const genderCode = gender === 'female' ? 'F' : 'M';
    const typeCode = type === 'full' ? 'F' : 'R';
    
    return `${genderCode}${typeCode}${ageGroup}`;
  }

  function getProgramName(program: string): string {
    const [gender, type, age] = [program[0], program[1], program.slice(2)];
    const genderName = gender === 'F' ? 'жінок' : 'чоловіків';
    const typeName = type === 'F' ? 'Повне обстеження' : 'Регулярне обстеження';
    const ageName = age === '20' ? 'до 30 років' : 
                   age === '30' ? '30-40 років' :
                   age === '40' ? '40-50 років' : 'від 50 років';
    
    return `${typeName} для ${genderName} ${ageName}`;
  }
// Функція для отримання точних характеристик програми
function getProgramSpecs(gender: string, age: number, examType: 'full' | 'regular') {
  const isFemale = gender === 'female';
  
  if (examType === 'full') {
    // Повне обстеження
    const systems = isFemale ? [
      { name: 'Репродуктивна система', level: 'комплексне' },
      { name: 'Серцево-судинна', level: 'базове' },
      { name: 'Ендокринна (щитоподібна залоза)', level: 'базове' },
      { name: 'Печінка та нирки', level: 'комплексне' },
      { name: 'Інфекційний скринінг', level: 'базове' }
    ] : [
      { name: 'Серцево-судинна', level: 'базове' },
      { name: 'Ендокринна (щитоподібна залоза)', level: 'базове' },
      { name: 'Печінка та нирки', level: 'комплексне' },
      { name: 'Інфекційний скринінг', level: 'базове' }
    ];

    // Додаємо онкоскринінг для 40+
    if (age >= 40) {
      systems.push({ name: 'Базовий онкоскринінг', level: 'базове' });
    }

    // Додаємо розширену кардіодіагностику для 50+
    if (age >= 50) {
      systems[isFemale ? 1 : 0] = { name: 'Серцево-судинна', level: 'комплексне' };
    }

    const doctors = isFemale ? 'терапевт, гінеколог' : 'терапевт';
    let uzdCount = 2;
    let analysesCount = '12-15';

    if (age >= 30) {
      uzdCount = isFemale ? 4 : 2;
      analysesCount = '15-18';
    }
    if (age >= 40) {
      uzdCount = isFemale ? 6 : 4;
      analysesCount = '18-20';
    }
    if (age >= 50) {
      uzdCount = isFemale ? 7 : 5;
      analysesCount = '20-22';
    }

    return {
      systems,
      doctors,
      uzdCount,
      analysesCount,
      recommended: 'Перше обстеження або раз на 2-3 роки'
    };
  } else {
    // Регулярне обстеження
    const systems = isFemale ? [
      { name: 'Репродуктивна система', level: 'базове' },
      { name: 'Загальне здоров\'я', level: 'базове' }
    ] : [
      { name: 'Загальне здоров\'я', level: 'базове' }
    ];

    const doctors = isFemale ? 'терапевт, гінеколог' : 'терапевт';
    const uzdCount = 0;
    const analysesCount = '5-7';

    return {
      systems,
      doctors,
      uzdCount,
      analysesCount,
      recommended: 'Щороку для контролю'
    };
  }
}
  // ✅ ВИПРАВЛЕННЯ 1: Видалено localProgramDetails
  function getProgramDetails(examType: 'full' | 'regular', gender: string, age: number) {
    const program = selectProgram(gender, age, examType);
    const isMobile = window.innerWidth < 768;
    
    // Шукаємо програму в завантажених даних з API
    const apiProgram = programs.find(p => p.program_id === program);
    
    if (apiProgram) {
      return {
        title: apiProgram.program_name || apiProgram.subtitle || 'Медична програма',
        description: apiProgram.short_description || 'Комплексна діагностика',
        keyDirections: apiProgram.key_directions ? 
          apiProgram.key_directions.split(/[;,]/).map(s => s.trim()).filter(s => s.length > 0).slice(0, isMobile ? 4 : 6) : 
          [],
        programComposition: apiProgram.program_composition || ''
      };
    }

    // ✅ КРИТИЧНЕ: Якщо немає даних з API - повертаємо null
    // Це означає що користувач побачить fallback UI
    return null;
  }

  // 3. API FUNCTIONS
  
  async function loadPrograms(): Promise<void> {
    try {
      const response = await fetch(API_PROGRAMS_URL);
      if (!response.ok) {
        console.warn('API програм недоступний');
        return;
      }
      
      const csv = await response.text();
      const rows = csv.trim().split('\n');
      
      if (rows.length < 2) {
        console.warn('Недостатньо даних програм в API');
        return;
      }

      const programsData: ProgramData[] = [];
      
      for (let i = 1; i < rows.length; i++) {
        const values = parseCSVRowProgram(rows[i]);
        
        if (values.length >= 17) {
          const program: ProgramData = {
            program_id: values[0] || '',
            program_name: values[1] || '',
            subtitle: values[2] || '',
            short_description: values[3] || '',
            key_directions: values[5] || '',
            program_composition: values[8] || '',
            preparation: values[11] || ''
          };
          
          if (program.program_id) {
            programsData.push(program);
          }
        }
      }
      
      setPrograms(programsData);
      console.log('Програми завантажено з API:', programsData.length);
    } catch (error) {
      console.error('Помилка завантаження програм:', error);
    }
  }

  function parseCSVRowProgram(row: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      
      if (char === '"') {
        if (inQuotes && row[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current);
    return result;
  }

  function parseCSVRow(headerRow: string, priceRow: string): Record<string, number> {
    const headers = headerRow.split(',').map(h => h.trim().replace(/"/g, ''));
    const prices = priceRow.split(',').map(p => p.trim().replace(/"/g, ''));
    const result: Record<string, number> = {};
    
    headers.forEach((header, index) => {
      if (header && prices[index]) {
        result[header] = parseInt(prices[index]) || 0;
      }
    });
    
    return result;
  }

  async function loadPrices(): Promise<void> {
    try {
      const response = await fetch(API_PRICES_URL);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const csv = await response.text();
      const rows = csv.trim().split('\n');
      
      if (rows.length < 8) throw new Error('Недостатньо рядків');

      const priceData: PriceData = {
        female_onclinic: parseCSVRow(rows[0], rows[1]),
        male_onclinic: parseCSVRow(rows[2], rows[3]),
        female_sanavita: parseCSVRow(rows[4], rows[5]),
        male_sanavita: parseCSVRow(rows[6], rows[7])
      };

      setPrices(priceData);
      console.log('Ціни завантажено:', Object.keys(priceData.female_onclinic).length, 'програм');
    } catch (error) {
      console.error('Помилка завантаження цін:', error);
      throw error;
    }
  }

  async function loadClinics(): Promise<void> {
    try {
      const clinicData: ClinicInfo = {
        onclinic: {
          name: "OnClinic Одеса",
          branches: [
            {
              name: "Центр",
              address: "вул. Мала Арнаутська, 56", 
              hours: "Пн-Пт: 8:30-19:30, Сб: 9:00-17:00, Нд: 9:00-14:00"
            },
            {
              name: "Таїрово", 
              address: "вул. Королева, 33Б",
              hours: "Пн-Пт: 8:00-19:00, Сб: 8:00-17:00, Нд: 8:00-14:00"
            }
          ],
          features: "Багатопрофільний медичний центр з власною лабораторією. Електронна медкарта та доступ до результатів онлайн. Вигідні пакети послуг. 2 філії",
          contact: "Через менеджера Check-up.in.ua"
        },
        sanavita: {
          name: "Sana Vita Одеса",
          address: "вул. Водопровідна, 2/5",
          hours: "Пн-Пт: 9:00-18:00, Сб: 9:00-16:00, Нд: вихідний", 
          features: "Приватна клініка з персональним підходом. Вигідні пакети послуг. Комфортна атмосфера",
          contact: "Через менеджера Check-up.in.ua"
        }
      };

      setClinics(clinicData);
      console.log('Дані клінік завантажено');
    } catch (error) {
      console.error('Помилка завантаження даних клінік:', error);
      throw error;
    }
  }

  function loadDemoData(): void {
    const demoPrices: PriceData = {
      female_onclinic: {
        'FF20_OnClinic': 7485, 'FR20_OnClinic': 3255, 'FF30_OnClinic': 9585, 'FR30_OnClinic': 3905,
        'FF40_OnClinic': 11465, 'FR40_OnClinic': 5835, 'FF50_OnClinic': 12415, 'FR50_OnClinic': 8415
      },
      male_onclinic: {
        'MF20_OnClinic': 4485, 'MR20_OnClinic': 1445, 'MF30_OnClinic': 6275, 'MR30_OnClinic': 1445,
        'MF40_OnClinic': 8525, 'MR40_OnClinic': 3375, 'MF50_OnClinic': 9475, 'MR50_OnClinic': 5855
      },
      female_sanavita: {
        'FF20_SanaVita': 7660, 'FR20_SanaVita': 3410, 'FF30_SanaVita': 9250, 'FR30_SanaVita': 4010,
        'FF40_SanaVita': 10760, 'FR40_SanaVita': 5700, 'FF50_SanaVita': 10780, 'FR50_SanaVita': 8000
      },
      male_sanavita: {
        'MF20_SanaVita': 4930, 'MR20_SanaVita': 1650, 'MF30_SanaVita': 6240, 'MR30_SanaVita': 1650,
        'MF40_SanaVita': 7770, 'MR40_SanaVita': 3340, 'MF50_SanaVita': 7770, 'MR50_SanaVita': 5640
      }
    };

    setPrices(demoPrices);
    console.log('Demo дані завантажено');
  }

  async function loadData(): Promise<void> {
    setLoading(true);
    setApiStatus('loading');
    
    try {
      const [pricesResult, clinicsResult, programsResult] = await Promise.allSettled([
        loadPrices(),
        loadClinics(),
        loadPrograms()
      ]);

      if (pricesResult.status === 'fulfilled' && clinicsResult.status === 'fulfilled') {
        setApiStatus('success');
        console.log('API підключено успішно');
        
        if (programsResult.status === 'fulfilled') {
          console.log('Програми також завантажено');
        } else {
          console.warn('Програми не завантажено');
        }
      } else {
        console.warn('API недоступний, використовуємо demo');
        setApiStatus('demo');
        loadDemoData();
        if (clinicsResult.status === 'rejected') {
          await loadClinics();
        }
      }
    } catch (error) {
      console.error('Критична помилка:', error);
      setApiStatus('demo');
      loadDemoData();
      await loadClinics();
    } finally {
      setLoading(false);
    }
  }

  // 4. BUSINESS LOGIC FUNCTIONS

  function calculateResult(): void {
    if (!prices) {
      alert('Ціни ще не завантажені. Зачекайте...');
      return;
    }

    const program = selectProgram(quizData.gender, quizData.age, quizData.examType);
    const genderKey = quizData.gender === 'female' ? 'female' : 'male';
    const onClinicKey = `${program}_OnClinic`;
    const sanaVitaKey = `${program}_SanaVita`;

    const onClinicPrice = prices[`${genderKey}_onclinic`][onClinicKey] || 0;
    const sanaVitaPrice = prices[`${genderKey}_sanavita`][sanaVitaKey] || 0;
    
    if (onClinicPrice === 0 || sanaVitaPrice === 0) {
      console.error('Не вдалося знайти ціни:', program);
      alert('Помилка розрахунку. Спробуйте ще раз.');
      return;
    }

    const savings = Math.abs(onClinicPrice - sanaVitaPrice);

    setResult({
      program,
      onclinic: onClinicPrice,
      sanavita: sanaVitaPrice,
      programName: getProgramName(program),
      savings
    });

    setStep(3);
  }

  async function submitLead(): Promise<void> {
    const requiredFields = [quizData.name, quizData.phone];
    if (quizData.examType !== 'individual') {
      requiredFields.push(quizData.preferredClinic);
    }
    
    if (requiredFields.some(field => !field)) {
      alert('Заповніть всі обов\'язкові поля');
      return;
    }

    setSubmitLoading(true);
    setSubmitStatus('idle');

    const getRequestTypeLabel = () => {
      if (quizData.examType === 'individual') {
        switch (quizData.requestType) {
          case 'extended': return 'Розширена програма (індивідуальна)';
          case 'individual': return 'Індивідуальна програма';
          case 'specialist': return `Консультація спеціаліста: ${quizData.specialistType}`;
          default: return 'Індивідуальна консультація';
        }
      } else {
        return quizData.requestType === 'extended' ? 
          `${result?.programName} + розширена` : 
          result?.programName || 'Стандартна програма';
      }
    };

    const leadData = {
      programType: getRequestTypeLabel(),
      name: quizData.name,
      phone: quizData.phone,
      email: quizData.email || 'Не вказано',
      gender: quizData.gender === 'female' ? 'Жінка' : 'Чоловік',
      age: quizData.age,
      preferredClinic: quizData.preferredClinic === 'onclinic' ? 'OnClinic Одеса' : 
                      quizData.preferredClinic === 'sanavita' ? 'SanaVita Одеса' : 
                      'Не обрано',
      priceOnClinic: result?.onclinic || 'Індивідуально',
      priceSanaVita: result?.sanavita || 'Індивідуально', 
      preferredDate1: quizData.preferredDate1 || 'Не вказано',
      preferredDate2: quizData.preferredDate2 || 'Не вказано',
      comments: quizData.comments || 'Немає',
      requestType: quizData.requestType,
      specialistType: quizData.specialistType || '',
      timestamp: new Date().toLocaleString('uk-UA'),
      source: 'roadmap.check-up.in.ua',
      shouldSendToClinic: ['standard', 'extended'].includes(quizData.requestType)
    };

    const message = `🎯 НОВА ЗАЯВКА З ROADMAP

📋 Програма: ${leadData.programType}
👤 ${leadData.name} (${leadData.gender}, ${leadData.age} років)
📞 ${leadData.phone}
📧 ${leadData.email}

🏥 Клініка: ${leadData.preferredClinic}
💰 Ціни: OnClinic ${leadData.priceOnClinic} ₴ | SanaVita ${leadData.priceSanaVita} ₴

📅 Бажані дати:
- Варіант 1: ${leadData.preferredDate1}
- Варіант 2: ${leadData.preferredDate2}

💬 Коментарі: ${leadData.comments}

${leadData.shouldSendToClinic ? 
  '✅ ВІДПРАВЛЕНО В КЛІНІКУ' : 
  '⚠️ ПОТРЕБУЄ ОБРОБКИ МЕНЕДЖЕРА'}

🕐 ${leadData.timestamp} | 🌐 ${leadData.source}`;

try {
  // Відправка в Telegram
  const response = await fetch('https://api.telegram.org/bot8356618616:AAErZb2Pm7HxAHhqIHvccB4Fn6ECRVmPS7Y/sendMessage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: '248929032',
      text: message
    })
  });

  if (!response.ok) {
    throw new Error('Telegram API error');
  }

  setSubmitStatus('success');
  
  // Скидання форми через 3 секунди
  setTimeout(() => {
    setStep(1);
    setResult(null);
    setSubmitStatus('idle');
    setQuizData({
      gender: '',
      age: 30,
      examType: '',
      name: '',
      phone: '',
      email: '',
      preferredClinic: ''
    });
  }, 3000);

} catch (error) {
  console.error('Помилка відправки:', error);
  setSubmitStatus('error');
} finally {
  setSubmitLoading(false);
}
  }

  // 5. USEEFFECT
  useEffect(() => {
    loadData();
  }, []);

  // 6. RENDER FUNCTIONS
  
  const renderContactForm = () => (
    <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-4 md:p-8 border border-gray-200">
      <h4 className="font-bold text-xl md:text-2xl text-gray-900 mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
        <Send className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
        Залишити контакти для запису
      </h4>
      
      <div className="grid gap-4 md:grid-cols-3 md:gap-6 mb-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Ім'я *</label>
          <input
            type="text"
            value={quizData.name}
            onChange={(e) => setQuizData({...quizData, name: e.target.value})}
            className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base md:text-lg"
            placeholder="Ваше ім'я"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Телефон *</label>
          <input
            type="tel"
            value={quizData.phone}
            onChange={(e) => setQuizData({...quizData, phone: e.target.value})}
            className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base md:text-lg"
            placeholder="+380..."
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={quizData.email}
            onChange={(e) => setQuizData({...quizData, email: e.target.value})}
            className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base md:text-lg"
            placeholder="email@example.com"
          />
        </div>
      </div>

      <div className="mb-6">
        <h5 className="font-semibold text-gray-800 mb-3">Зручні дати для обстеження (оберіть 2 варіанти)</h5>
        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Варіант 1</label>
            <input
              type="date"
              value={quizData.preferredDate1}
              onChange={(e) => setQuizData({...quizData, preferredDate1: e.target.value})}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Варіант 2</label>
            <input
              type="date"
              value={quizData.preferredDate2}
              onChange={(e) => setQuizData({...quizData, preferredDate2: e.target.value})}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
          <p className="text-blue-800 text-sm flex items-start gap-2">
            <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>
              <strong>Рекомендуємо планувати візит на ранок (8:00-10:00)</strong>, оскільки 
              більшість аналізів здаються натщесерця для точності результатів.
            </span>
          </p>
        </div>
      </div>

      {quizData.gender === 'female' && (
        <div className="mb-6">
          <div className="p-4 bg-pink-50 border border-pink-200 rounded-lg">
            <h5 className="font-semibold text-pink-800 mb-2 flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Важливо для жінок
            </h5>
            <p className="text-pink-700 text-sm mb-3">
              Для точності гінекологічних досліджень (ПАП-тест та УЗД молочних залоз) 
              рекомендується проходити обстеження в <strong>5-12 день менструального циклу</strong>.
            </p>
            <p className="text-pink-600 text-sm">
              Якщо не виходить спланувати обстеження в рекомендований період, 
              обов'язково вкажіть це в коментарі нижче.
            </p>
          </div>
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Коментарі та додаткові побажання
        </label>
        <textarea
          value={quizData.comments}
          onChange={(e) => setQuizData({...quizData, comments: e.target.value})}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base resize-none"
          placeholder="Вкажіть особливі побажання, скарги на здоров'я, інформацію про менструальний цикл тощо..."
        />
      </div>

      {submitStatus === 'success' ? (
        <div className="bg-green-100 border border-green-300 rounded-lg p-6 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
          <div className="text-green-800 font-semibold text-lg mb-2">Заявка успішно відправлена!</div>
          <div className="text-green-700 mb-4">
            Наш менеджер зв'яжеться з вами протягом робочого дня для підтвердження запису та уточнення деталей
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => {
                setStep(1); 
                setResult(null); 
                setSubmitStatus('idle');
                setQuizData({
                  gender: '', age: 30, examType: '', name: '', 
                  phone: '', email: '', preferredClinic: '',
                  preferredDate1: '', preferredDate2: '', comments: '',
                  requestType: '', specialistType: ''
                });
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Підібрати іншу програму
            </button>
            {quizData.examType !== 'individual' && programs.length > 0 && (
              <button
                onClick={() => setShowProgramDetails(quizData.examType as 'full' | 'regular')}
                className="bg-white border border-green-600 text-green-700 hover:bg-green-50 px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Переглянути деталі програми
              </button>
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={submitLead}
          disabled={!quizData.name || !quizData.phone || (quizData.examType !== 'individual' && !quizData.preferredClinic) || submitLoading}
          className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 md:py-4 px-6 md:px-8 rounded-xl font-bold text-base md:text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-700 hover:to-teal-700 transition-all duration-300 flex items-center justify-center gap-2 md:gap-3 shadow-lg"
        >
          {submitLoading ? (
            <>
              <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" />
              <span>Відправляємо...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5 md:w-6 md:h-6" />
              <span>Відправити заявку</span>
            </>
          )}
        </button>
      )}

      {submitStatus === 'error' && (
        <div className="mt-4 bg-red-100 border border-red-300 rounded-lg p-4 text-center">
          <div className="text-red-800 font-semibold">Помилка відправки</div>
          <div className="text-red-700 text-sm mt-1">Спробуйте ще раз</div>
        </div>
      )}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6 md:space-y-8">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-600 to-teal-600 rounded-2xl flex items-center justify-center mb-4 md:mb-6 shadow-lg">
          <Users className="w-8 h-8 md:w-10 md:h-10 text-white" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-3">Розкажіть про себе</h2>
        <p className="text-gray-600 text-base md:text-lg px-4 md:px-0">Ці дані допоможуть підібрати оптимальну програму обстеження</p>
      </div>

      <div className="space-y-6 md:space-y-8">
        <div>
          <label className="block text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">Ваша стать</label>
          <div className="grid grid-cols-2 gap-4 md:gap-6">
            {[
              { value: 'female', label: 'Жінка', icon: '👩' },
              { value: 'male', label: 'Чоловік', icon: '👨' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setQuizData({...quizData, gender: option.value as 'female' | 'male'})}
                className={`p-4 md:p-6 rounded-2xl border-3 transition-all duration-300 transform hover:scale-105 ${
                  quizData.gender === option.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="text-3xl md:text-4xl mb-2 md:mb-3">{option.icon}</div>
                <div className="font-semibold text-lg md:text-xl">{option.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
<label className="block text-lg font-semibold text-gray-800 mb-4">
  Ваш вік: <span className="text-blue-600 font-bold text-xl">{getAgeRange(quizData.age)} років</span>
</label>
          
          <div className="relative hidden md:block">
            <input
              type="range"
              min="18"
              max="80"
              value={quizData.age}
              onChange={(e) => setQuizData({...quizData, age: parseInt(e.target.value)})}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer touch-slider"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((quizData.age - 18) / 62) * 100}%, #e5e7eb ${((quizData.age - 18) / 62) * 100}%, #e5e7eb 100%)`
              }}
            />
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span className="font-medium">18 років</span>
              <span className="font-medium">80 років</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:hidden">
            {[
  { range: '18-30', value: 25, label: '18-30 років' },
  { range: '30-40', value: 35, label: '30-40 років' },
  { range: '40-50', value: 45, label: '40-50 років' },
  { range: '50+', value: 55, label: '50+ років' }
].map((ageGroup) => (
  <button
    key={ageGroup.range}
    onClick={() => setQuizData({...quizData, age: ageGroup.value})}
    className={`p-3 rounded-xl border-2 transition-all duration-300 text-center ${
      getAgeRange(quizData.age) === ageGroup.range
        ? 'border-blue-500 bg-blue-50 text-blue-700'
        : 'border-gray-200 hover:border-gray-300'
    }`}
  >
    <div className="font-semibold text-sm">{ageGroup.label}</div>
  </button>
))}
          </div>
        </div>
      </div>

      <button
        onClick={() => setStep(2)}
        disabled={!quizData.gender}
        className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3 md:py-4 px-6 md:px-8 rounded-xl font-semibold text-base md:text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-700 hover:to-teal-700 transition-all duration-300 flex items-center justify-center gap-2 md:gap-3 shadow-lg transform hover:scale-105"
      >
        Далі <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
      </button>
    </div>
  );

  // ✅ ВИПРАВЛЕННЯ 3: Fallback UI для модального вікна
  const renderProgramDetailsModal = () => {
    if (!showProgramDetails) return null;
    
    const details = getProgramDetails(showProgramDetails, quizData.gender, quizData.age);
    
    // Якщо немає даних з API - показуємо дружнє повідомлення
    if (!details) {
      return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Дані тимчасово недоступні
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Наш менеджер зв'яжеться з вами та детально розповість про цю програму обстеження, 
              відповість на всі питання та допоможе підібрати оптимальний варіант.
            </p>
            <button
              onClick={() => setShowProgramDetails(null)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Зрозуміло
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto modal-scroll">
          <div className="p-6 md:p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  {details.title}
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {details.description}
                </p>
              </div>
              <button
                onClick={() => setShowProgramDetails(null)}
                className="ml-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {details.keyDirections.length > 0 && (
              <div className="mb-8">
                <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                    </svg>
                  </div>
                  Ключові напрямки
                </h4>
                <div className="grid md:grid-cols-2 gap-3">
                  {details.keyDirections.map((direction, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700 text-sm md:text-base">{direction}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {details.programComposition && (
              <div className="mb-8">
                <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-4 h-4 text-orange-600" />
                  </div>
                  Що входить до програми
                </h4>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-gray-700 leading-relaxed text-sm md:text-base space-y-3">
                    {details.programComposition.split(';').map((item, index) => (
                      item.trim() && (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="font-medium">{item.trim()}</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setQuizData({...quizData, examType: showProgramDetails});
                  setShowProgramDetails(null);
                }}
                className="flex-1 bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-teal-700 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                Обрати цю програму
              </button>
              <button
                onClick={() => setShowProgramDetails(null)}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 font-semibold transition-colors"
              >
                Закрити
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

const renderStep2 = () => {
  return (
    <Step2 
      data={quizData}
      onUpdate={(updates) => setQuizData(prev => ({ ...prev, ...updates }))}
      onNext={() => {
        if (quizData.examType === 'individual') {
          setStep(3);
        } else {
          calculateResult();
        }
      }}
      onBack={() => setStep(1)}
    />
  );
};

  const renderStep3 = () => {
    if (quizData.examType === 'individual') {
      return renderIndividualConsultationStep();
    }
    return renderStandardProgramStep();
  };

  const renderIndividualConsultationStep = () => (
    <div className="space-y-8">
      <div className="text-center">
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
          <Users className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Індивідуальна консультація</h2>
        <p className="text-gray-600 text-lg">Наш менеджер підбере оптимальну програму або спеціаліста згідно ваших потреб</p>
      </div>

      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
        <h4 className="font-bold text-xl text-gray-900 mb-4">Оберіть тип консультації</h4>
        <div className="grid gap-4">
          {[
            {
              value: 'extended',
              title: 'Розширена програма',
              description: 'Стандартна програма + додаткові дослідження'
            },
            {
              value: 'individual', 
              title: 'Індивідуальна програма',
              description: 'Повністю персональний перелік досліджень'
            },
            {
              value: 'specialist',
              title: 'Консультація спеціаліста',
              description: 'Направлення до конкретного вузького спеціаліста'
            }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setQuizData({...quizData, requestType: option.value as 'extended' | 'individual' | 'specialist'})}
              className={`p-4 rounded-xl border-2 text-left transition-all duration-300 ${
                quizData.requestType === option.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <h5 className="font-semibold text-lg mb-2">{option.title}</h5>
              <p className="text-gray-600 text-sm">{option.description}</p>
            </button>
          ))}
        </div>

        {quizData.requestType === 'specialist' && (
          <div className="mt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">До якого лікаря хочете звернутися?</label>
            <input
              type="text"
              value={quizData.specialistType}
              onChange={(e) => setQuizData({...quizData, specialistType: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Наприклад: кардіолог, гастроентеролог..."
            />
          </div>
        )}
      </div>

      {renderContactForm()}
    </div>
  );

  const renderStandardProgramStep = () => (
    <div className="space-y-8">
      <div className="text-center">
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-600 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
          <Star className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Ваші результати</h2>
        <p className="text-gray-600 text-lg">{result?.programName}</p>
        {result?.savings > 0 && (
          <p className="text-green-600 font-semibold mt-2">
            Економія до {result.savings.toLocaleString()} ₴ залежно від клініки
          </p>
        )}
        
        {programs.length > 0 && (
          <button
            onClick={() => setShowProgramDetails(quizData.examType as 'full' | 'regular')}
            className="mt-4 inline-flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Детальніше про програму
          </button>
        )}
      </div>

      {apiStatus === 'demo' && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-center gap-3 text-yellow-800">
            <AlertCircle className="w-6 h-6" />
            <div>
              <div className="font-semibold">Демонстраційні дані</div>
              <div className="text-sm">Актуальні ціни з Google Sheets для тестування</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:gap-8">
        {[
          {
            id: 'onclinic',
            name: clinics?.onclinic.name || 'OnClinic Одеса',
            price: result?.onclinic || 0,
            branches: clinics?.onclinic.branches || [],
            features: clinics?.onclinic.features || 'Національна мережа',
            contact: clinics?.onclinic.contact || 'Через менеджера',
            isWinner: (result?.onclinic || 0) < (result?.sanavita || 0)
          },
          {
            id: 'sanavita',
            name: clinics?.sanavita.name || 'Sana Vita Одеса',
            price: result?.sanavita || 0,
            address: clinics?.sanavita.address || 'вул. Водопровідна, 2/5',
            hours: clinics?.sanavita.hours || 'Пн-Пт: 9:00-18:00',
            features: clinics?.sanavita.features || 'Приватна клініка',
            contact: clinics?.sanavita.contact || 'Через менеджера',
            isWinner: (result?.sanavita || 0) < (result?.onclinic || 0)
          }
        ].map((clinic) => (
          <div 
            key={clinic.id} 
            className={`relative border-3 rounded-2xl p-4 md:p-8 transition-all duration-300 hover:shadow-xl ${
              clinic.isWinner 
                ? 'border-green-400 bg-green-50 shadow-lg' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {clinic.isWinner && (
              <div className="absolute -top-3 left-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm px-4 py-2 rounded-full font-semibold shadow-lg">
                💰 Найкраща ціна
              </div>
            )}
            
            <div className="flex justify-between items-start mb-4 md:mb-6">
              <h3 className="font-bold text-lg md:text-2xl text-gray-900">{clinic.name}</h3>
              <div className={`text-xl md:text-3xl font-bold ${
                clinic.isWinner ? 'text-green-600' : 'text-blue-600'
              }`}>
                {clinic.price.toLocaleString()} ₴
              </div>
            </div>
            
            <div className="space-y-4 text-gray-700">
              {clinic.branches && clinic.branches.length > 0 ? (
                clinic.branches.map((branch, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      <div>
                        <div className="font-semibold">{branch.name}</div>
                        <div>{branch.address}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-8">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{branch.hours}</span>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <span>{clinic.address}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <span>{clinic.hours}</span>
                  </div>
                </>
              )}
              
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm leading-relaxed">{clinic.features}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-500" />
                <span className="text-sm">{clinic.contact}</span>
              </div>
            </div>

            <button 
              onClick={() => setQuizData({...quizData, preferredClinic: clinic.id as 'onclinic' | 'sanavita'})}
              className={`w-full mt-6 py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
                quizData.preferredClinic === clinic.id
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
              }`}
            >
              {quizData.preferredClinic === clinic.id ? 'Обрано ✓' : 'Обрати цю клініку'}
            </button>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-2xl p-6 border border-blue-200">
        <h4 className="font-bold text-xl text-gray-900 mb-4">Чи потрібні додаткові дослідження?</h4>
        <div className="grid gap-3">
          {[
            {
              value: 'standard',
              title: 'Стандартна програма',
              description: 'Обрана програма повністю підходить'
            },
            {
              value: 'extended',
              title: 'Розширити програму',
              description: 'Додати дослідження на розсуд лікаря'
            }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setQuizData({...quizData, requestType: option.value as 'standard' | 'extended'})}
              className={`p-3 rounded-lg border-2 text-left transition-all duration-300 ${
                quizData.requestType === option.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <h5 className="font-semibold mb-1">{option.title}</h5>
              <p className="text-gray-600 text-sm">{option.description}</p>
            </button>
          ))}
        </div>
      </div>

      {renderContactForm()}



      {submitStatus !== 'success' && (
        <button
          onClick={() => {
            setStep(1); 
            setResult(null); 
            setSubmitStatus('idle');
            setQuizData({
              gender: '', age: 30, examType: '', name: '', 
              phone: '', email: '', preferredClinic: '',
              preferredDate1: '', preferredDate2: '', comments: '',
              requestType: '', specialistType: ''
            });
          }}
          className="w-full bg-gray-100 text-gray-700 py-4 px-6 rounded-xl font-semibold text-lg hover:bg-gray-200 transition-all duration-300"
        >
          Почати заново
        </button>
      )}
    </div>
  );

  // 7. MAIN RENDER
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-4">
  Навігатор медичних обстежень
</h1>
<p className="text-gray-600 text-xl max-w-2xl mx-auto leading-relaxed">
  Дізнайтеся точну вартість саме вашої програми та оберіть клініку
</p>
          {apiStatus === 'success' && (
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mt-4">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Підключено до реальної бази цін
            </div>
          )}
          {apiStatus === 'loading' && (
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mt-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              Завантажуємо дані...
            </div>
          )}
        </div>

        <div className="max-w-md mx-auto mb-12">
          <div className="flex justify-between items-center">
            {[
              { num: 1, label: 'Дані' },
              { num: 2, label: 'Програма' },
              { num: 3, label: 'Результат' }
            ].map((stepInfo, index) => (
              <div key={stepInfo.num} className="flex items-center">
                <div className={`relative w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                  step >= stepInfo.num 
                    ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-lg' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepInfo.num}
                  <div className="absolute -bottom-8 text-xs font-medium text-gray-600 whitespace-nowrap">
                    {stepInfo.label}
                  </div>
                </div>
                {index < 2 && (
                  <div className={`w-20 h-2 mx-3 rounded-full transition-all duration-300 ${
                    step > stepInfo.num ? 'bg-gradient-to-r from-blue-600 to-teal-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl p-6 md:p-10 border border-gray-100">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        <div className="text-center mt-12 text-gray-500">
  <p className="text-lg">🏥 roadmap.check-up.in.ua • Розумний калькулятор чекапів</p>
  <p className="text-sm mt-2">Робимо контроль стану здоров'я простим та зрозумілим</p>
</div>
      
{renderProgramDetailsModal()}
      </div>
    </div>
  );
};

export default RoadmapCheckup;
