
export const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
};

export const isTablet = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= 768 && window.innerWidth < 1024;
};

export const isDesktop = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= 1024;
};

export const getTouchableSize = () => {
  return isMobile() ? 'h-12 min-w-12' : 'h-10 min-w-10';
};

export const getTextSize = (base: string) => {
  const sizes = {
    xs: isMobile() ? 'text-xs' : 'text-sm',
    sm: isMobile() ? 'text-sm' : 'text-base',
    base: isMobile() ? 'text-base' : 'text-lg',
    lg: isMobile() ? 'text-lg' : 'text-xl',
    xl: isMobile() ? 'text-xl' : 'text-2xl',
    '2xl': isMobile() ? 'text-2xl' : 'text-3xl',
    '3xl': isMobile() ? 'text-3xl' : 'text-4xl',
  };
  
  return sizes[base as keyof typeof sizes] || base;
};
