import { Zap } from "lucide-react";
import { Link } from "wouter";

export default function Footer() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12">
      <div className="max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img 
                src="/logo.png" 
                alt="ElectroLight Logo" 
                className="w-8 h-8 object-contain"
              />
              <h3 className="text-xl font-bold">ElectroLight</h3>
            </div>
            <p className="text-gray-300 dark:text-gray-400 mb-4">Professional electrical products for every project.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-primary">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="#" className="text-gray-300 hover:text-primary">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-gray-300 hover:text-primary">
                <i className="fab fa-linkedin"></i>
              </a>
              <a href="#" className="text-gray-300 hover:text-primary">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-300 dark:text-gray-400">
              <li>
                <button 
                  onClick={() => scrollToSection('home')}
                  className="hover:text-primary transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('products')}
                  className="hover:text-primary transition-colors"
                >
                  Products
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('about')}
                  className="hover:text-primary transition-colors"
                >
                  About
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('contact')}
                  className="hover:text-primary transition-colors"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product Categories</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-primary">Lighting</a></li>
              <li><a href="#" className="hover:text-primary">Wiring</a></li>
              <li><a href="#" className="hover:text-primary">Safety</a></li>
              <li><a href="#" className="hover:text-primary">Tools</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-primary">Help Center</a></li>
              <li><a href="#" className="hover:text-primary">Returns</a></li>
              <li><a href="#" className="hover:text-primary">Shipping</a></li>
              <li><a href="#" className="hover:text-primary">FAQs</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; 2024 ElectroLight. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
