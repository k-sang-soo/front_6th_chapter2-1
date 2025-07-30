import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: React.ReactNode;
}

/**
 * 공통 Button 컴포넌트
 *
 * @param variant - 버튼 스타일 변형 (primary, secondary, danger)
 * @param size - 버튼 크기 (sm, md, lg)
 * @param fullWidth - 전체 너비 사용 여부
 * @param children - 버튼 내용
 * @param props - 기타 HTML button 속성
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantStyles = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500 disabled:bg-gray-300',
    secondary:
      'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500 disabled:bg-gray-100',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 disabled:bg-gray-300',
  };

  const sizeStyles = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  const buttonClassName = [
    baseStyles,
    variantStyles[variant],
    sizeStyles[size],
    widthStyle,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={buttonClassName} disabled={disabled} {...props}>
      {children}
    </button>
  );
};
