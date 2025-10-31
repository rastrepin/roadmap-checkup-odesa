export interface QuizData {
  gender: 'male' | 'female' | '';
  age: number;
  examType: 'full' | 'regular' | 'individual' | '';
  name: string;
  phone: string;
  email: string;
  preferredClinic: string;
  preferredDate1: string;
  preferredDate2: string;
  comments: string;
  requestType: string;
  specialistType: string;
}

export interface LeadData {
  name: string;
  phone: string;
  email: string;
  program: string;
  preferredClinic: string;
  priceOnClinic: number;
  priceSanaVita: number;
  timestamp: string;
}