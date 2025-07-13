
import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'mr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    master: 'Master',
    transactions: 'Transactions',
    reports: 'Reports',
    dairyReports: 'Dairy Reports',
    system: 'System',
    
    // Common
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    add: 'Add',
    close: 'Close',
    submit: 'Submit',
    reset: 'Reset',
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    import: 'Import',
    print: 'Print',
    
    // Master Data
    centreManagement: 'Centre Management',
    farmerManagement: 'Farmer Management',
    milkBuyers: 'Milk Buyers',
    milkPricing: 'Milk Pricing',
    animalFodder: 'Animal Fodder',
    
    // Forms
    centreNumber: 'Centre Number',
    centreName: 'Centre Name',
    address: 'Address',
    paymentCycle: 'Payment Cycle',
    farmerName: 'Farmer Name',
    farmerId: 'Farmer ID',
    phoneNumber: 'Phone Number',
    bankName: 'Bank Name',
    accountNumber: 'Account Number',
    ifscCode: 'IFSC Code',
    aadharNumber: 'Aadhar Number',
    
    // Transactions
    milkCollection: 'Milk Collection',
    milkDelivery: 'Milk Delivery',
    paymentAdjustment: 'Payment Adjustment',
    cattleFeedSale: 'Cattle Feed Sale',
    balanceRecovery: 'Balance Recovery',
    
    // Time
    morning: 'Morning',
    evening: 'Evening',
    date: 'Date',
    time: 'Time',
    
    // Measurements
    liters: 'Liters',
    fat: 'Fat',
    snf: 'SNF',
    rate: 'Rate',
    amount: 'Amount',
    quantity: 'Quantity',
    
    // Status
    active: 'Active',
    inactive: 'Inactive',
    pending: 'Pending',
    completed: 'Completed',
    processing: 'Processing'
  },
  mr: {
    // Navigation
    dashboard: 'डॅशबोर्ड',
    master: 'मास्टर',
    transactions: 'व्यवहार',
    reports: 'अहवाल',
    dairyReports: 'डेअरी अहवाल',
    system: 'सिस्टम',
    
    // Common
    save: 'जतन करा',
    cancel: 'रद्द करा',
    edit: 'संपादित करा',
    delete: 'हटवा',
    add: 'जोडा',
    close: 'बंद करा',
    submit: 'सबमिट करा',
    reset: 'रीसेट करा',
    search: 'शोधा',
    filter: 'फिल्टर',
    export: 'निर्यात',
    import: 'आयात',
    print: 'प्रिंट',
    
    // Master Data
    centreManagement: 'केंद्र व्यवस्थापन',
    farmerManagement: 'शेतकरी व्यवस्थापन',
    milkBuyers: 'दूध खरेदीदार',
    milkPricing: 'दूध किंमत',
    animalFodder: 'पशुखाद्य',
    
    // Forms
    centreNumber: 'केंद्र क्रमांक',
    centreName: 'केंद्राचे नाव',
    address: 'पत्ता',
    paymentCycle: 'पेमेंट सायकल',
    farmerName: 'शेतकरीचे नाव',
    farmerId: 'शेतकरी आयडी',
    phoneNumber: 'फोन नंबर',
    bankName: 'बँकेचे नाव',
    accountNumber: 'खाते क्रमांक',
    ifscCode: 'आयएफएससी कोड',
    aadharNumber: 'आधार क्रमांक',
    
    // Transactions
    milkCollection: 'दूध संकलन',
    milkDelivery: 'दूध वितरण',
    paymentAdjustment: 'पेमेंट समायोजन',
    cattleFeedSale: 'गुरे खाद्य विक्री',
    balanceRecovery: 'शिल्लक वसुली',
    
    // Time
    morning: 'सकाळ',
    evening: 'संध्याकाळ',
    date: 'दिनांक',
    time: 'वेळ',
    
    // Measurements
    liters: 'लिटर',
    fat: 'चरबी',
    snf: 'एसएनएफ',
    rate: 'दर',
    amount: 'रक्कम',
    quantity: 'प्रमाण',
    
    // Status
    active: 'सक्रिय',
    inactive: 'निष्क्रिय',
    pending: 'प्रलंबित',
    completed: 'पूर्ण',
    processing: 'प्रक्रिया'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
