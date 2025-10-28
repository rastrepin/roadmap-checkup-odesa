export interface QuizData {
  gender: 'male' | 'female' | '';
  age: string;
  examinationType: 'full' | 'regular' | '';
}

export interface ClinicPrice {
  clinic: string;
  fullExamPrice: number;
  regularExamPrice: number;
  contact: {
    phone: string;
    email: string;
    address: string;
  };
}

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  selectedClinic: string;
}