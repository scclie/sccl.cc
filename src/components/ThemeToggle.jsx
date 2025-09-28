import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState('dark');
  const [mounted, setMounted] = useState(false);

  // Проверяем тему при монтировании компонента
  useEffect(() => {
    const savedTheme = typeof window !== 'undefined' 
      ? (localStorage.getItem('theme') || 
         (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'))
      : 'dark';
    
    setTheme(savedTheme);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    if (typeof window === 'undefined') return;
    
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  // Не показываем кнопку до полной загрузки
  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-lg bg-nord-4 dark:bg-nord-1 animate-pulse"></div>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative w-10 h-10 rounded-lg bg-nord-6 dark:bg-nord-1 border border-nord-4 dark:border-nord-3 hover:bg-nord-5 dark:hover:bg-nord-2 transition-all duration-300 flex items-center justify-center group"
      aria-label={`Переключить на ${theme === 'dark' ? 'светлую' : 'темную'} тему`}
    >
      <div className="relative w-5 h-5">
        {theme === 'dark' ? (
          <Sun 
            className="w-5 h-5 text-nord-13 group-hover:text-nord-12 transition-all duration-300 rotate-0 group-hover:rotate-12 group-hover:scale-110" 
          />
        ) : (
          <Moon 
            className="w-5 h-5 text-nord-10 group-hover:text-nord-9 transition-all duration-300 rotate-0 group-hover:-rotate-12 group-hover:scale-110" 
          />
        )}
      </div>
      
      {/* Анимированный фон при ховере */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-nord-8 to-nord-10 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
    </button>
  );
}