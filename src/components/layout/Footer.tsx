import { Link } from 'react-router-dom';
import { Briefcase, Mail, Phone, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="p-1.5 bg-blue-600 rounded-lg">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">JOB<span className="text-blue-600">ENROLL</span></span>
            </Link>
            <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
              Your one-stop destination for government job notifications, competitive exam prep, and skill building. Empowering aspirants since 2024.
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Resources</h4>
            <div className="space-y-2">
              <Link to="/" className="block text-gray-500 hover:text-blue-600 text-sm transition-colors">Latest Jobs</Link>
              <Link to="/quiz" className="block text-gray-500 hover:text-blue-600 text-sm transition-colors">Free Quizzes</Link>
              <Link to="/typing" className="block text-gray-500 hover:text-blue-600 text-sm transition-colors">Typing Test</Link>
              <Link to="/books" className="block text-gray-500 hover:text-blue-600 text-sm transition-colors">Bookstore</Link>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Mail className="w-4 h-4" />
                <span>support@jobenroll.com</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Phone className="w-4 h-4" />
                <span>+91 98765 43210</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-gray-400 text-xs text-center">
            &copy; {new Date().getFullYear()} JOBENROLL Platform. All rights reserved. Built with ❤️ for aspirants.
          </p>
          <div className="flex space-x-6">
             <Link to="#" className="text-gray-400 hover:text-blue-600 text-xs">Privacy Policy</Link>
             <Link to="#" className="text-gray-400 hover:text-blue-600 text-xs">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
