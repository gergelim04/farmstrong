'use client'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  message?: string
}

const sizeStyles = {
  sm: 'w-5 h-5',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
}

/** Spinner de carregamento com mensagem opcional */
export default function LoadingSpinner({ size = 'md', message }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8" role="status">
      <div
        className={`${sizeStyles[size]} border-3 border-gray-200 border-t-primary rounded-full animate-spin`}
      />
      {message && (
        <p className="text-sm text-gray-500">{message}</p>
      )}
      <span className="sr-only">Carregando...</span>
    </div>
  )
}
