import React from 'react';
import { useAuth } from '../context/AuthContext'; // Updated to use the correct AuthContext import path
import { ShieldAlert } from 'lucide-react';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, userData, isLoading } = useAuth(); // userData stores the user's role

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  // यदि यूज़र लॉग इन नहीं है, या उसका रोल 'admin' नहीं है, तो उसे होम पेज पर वापस भेज दें
  if (!user || userData?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">पहुँच अस्वीकृत</h2>
        <p className="text-slate-500 mt-2 mb-6">क्षमा करें, आपके पास इस एडमिन पेज को देखने का अधिकार नहीं है।</p>
        <button 
          onClick={() => window.location.href = '/'}
          className="bg-brand-500 text-white px-6 py-2 rounded-lg font-medium"
        >
          होम पर वापस जाएँ
        </button>
      </div>
    );
  }

  // यदि यूज़र एडमिन है, तो उसे सुरक्षित पेज दिखाएं
  return <>{children}</>;
};

export default AdminRoute;
