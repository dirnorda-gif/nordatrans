import { Phone, Menu, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Определяем активную секцию на основе pathname
  useEffect(() => {
    if (location.pathname === '/') {
      setActiveSection("home");
    } else if (location.pathname === '/tarify' || location.pathname === '/tarify-iz-moskvy') {
      setActiveSection("tariffs");
    } else if (location.pathname === '/pereezd' || location.pathname === '/pereezd-iz') {
      setActiveSection("moving");
    } else if (location.pathname === '/fleet') {
      setActiveSection("fleet");
    } else if (location.pathname === '/contacts') {
      setActiveSection("contacts");
    } else {
      // На других страницах (например, /thanks) нет активного пункта меню
      setActiveSection("");
    }
  }, [location.pathname]);

  const scrollToSection = (sectionId: string) => {
    // Если мы не на главной странице, сначала переходим туда
    if (window.location.pathname !== '/') {
      navigate('/');
      // Даём время на загрузку страницы, затем скроллим
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleTariffsClick = () => {
    navigate('/tarify');
  };

  const handleMovingClick = () => {
    navigate('/pereezd');
  };

  const handleFleetClick = () => {
    navigate('/fleet');
  };

  const handleContactsClick = () => {
    navigate('/contacts');
  };

  const navItems = [
    { id: "home", label: "Главная", action: handleHomeClick },
    { id: "tariffs", label: "Тарифы", action: handleTariffsClick },
    { id: "moving", label: "Переезд", action: handleMovingClick },
    { id: "fleet", label: "Автопарк", action: handleFleetClick },
    { id: "contacts", label: "Контакты", action: handleContactsClick },
  ];

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Logo and company name */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity"
          >
            <picture>
              <source srcSet="/logo_norda.webp" type="image/webp" />
              <img 
                src="/logo_norda.png" 
                alt="NORDA TRANS Logo"
                width="48"
                height="48"
                className="w-10 md:w-12 h-auto"
              />
            </picture>
            <div className="flex flex-col">
              <h1 className="text-lg md:text-2xl font-bold whitespace-nowrap">NORDA TRANS</h1>
              <p className="text-[10px] md:text-sm font-light tracking-wide text-muted-foreground">транспортная компания</p>
            </div>
          </button>
          
          {/* Desktop Navigation - скрыто на мобильных */}
          <nav className="hidden lg:flex items-center gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={item.action}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${
                  activeSection === item.id
                    ? "text-white shadow-md"
                    : "hover:scale-105"
                }`}
                style={activeSection === item.id ? {backgroundColor: '#405b9a'} : {}}
                onMouseEnter={(e) => {
                  if (activeSection !== item.id) {
                    e.currentTarget.style.backgroundColor = '#405b9a';
                    e.currentTarget.style.color = 'white';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeSection !== item.id) {
                    e.currentTarget.style.backgroundColor = '';
                    e.currentTarget.style.color = '';
                  }
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>
          
          {/* Desktop Phone numbers - скрыто на мобильных */}
          <div className="hidden lg:flex flex-col items-end gap-2">
            <a href="tel:+74994440651" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Phone className="w-5 h-5 text-primary" />
              <span className="text-base font-semibold">+7 (499) 444-06-51</span>
            </a>
            <a href="https://wa.me/79299882201" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-green-600 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#25D366">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              <span className="text-base font-semibold">+7 929 988-22-01</span>
            </a>
          </div>

          {/* Mobile - Burger Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-border pt-4 space-y-3">
            {/* Navigation Links */}
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  item.action();
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg text-base font-medium transition-all ${
                  activeSection === item.id
                    ? "text-white shadow-md"
                    : "hover:bg-gray-100"
                }`}
                style={activeSection === item.id ? {backgroundColor: '#405b9a'} : {}}
              >
                {item.label}
              </button>
            ))}
            
            {/* Phone Numbers */}
            <div className="border-t border-border pt-3 space-y-2">
              <a href="tel:+74994440651" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Phone className="w-5 h-5 text-primary" />
                <span className="text-base font-semibold">+7 (499) 444-06-51</span>
              </a>
              <a href="https://wa.me/79299882201" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#25D366">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                <span className="text-base font-semibold">+7 929 988-22-01</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

