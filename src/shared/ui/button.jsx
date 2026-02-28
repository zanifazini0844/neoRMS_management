import React from 'react';

export const Button = React.forwardRef(function Button(
  { className = '', variant = 'default', type = 'button', ...props },
  ref
) {
  const base =
    'inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C3110C] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 rounded-md px-4 py-2';

  const variants = {
    default: 'bg-[#C3110C] text-white hover:bg-[#E6501B]',
    outline:
      'border border-[#C3110C] bg-white text-[#C3110C] hover:bg-[#FDE2D3]',
    ghost: 'bg-transparent text-[#C3110C] hover:bg-[#FDE2D3]',
  };

  const variantClasses = variants[variant] || variants.default;

  return (
    <button
      ref={ref}
      type={type}
      className={`${base} ${variantClasses} ${className}`}
      {...props}
    />
  );
});

