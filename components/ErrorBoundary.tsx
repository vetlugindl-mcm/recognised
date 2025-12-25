import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ExclamationCircleIcon } from './icons';

interface Props {
  children?: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-[300px] flex items-center justify-center p-6">
             <div className="glass-panel rounded-2xl p-8 max-w-md w-full text-center shadow-2xl border-red-100 bg-white/80">
                 <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100">
                    <ExclamationCircleIcon className="w-6 h-6" />
                 </div>
                 
                 <h2 className="text-lg font-bold text-gray-900 mb-2">
                     {this.props.fallbackTitle || "Что-то пошло не так"}
                 </h2>
                 
                 <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                     Произошла ошибка при отображении этого компонента. 
                     Мы уже записали детали. Попробуйте обновить страницу.
                 </p>

                 <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-6 text-left overflow-hidden">
                     <code className="text-[10px] text-gray-600 font-mono break-all">
                        {this.state.error?.message}
                     </code>
                 </div>

                 <button
                    onClick={() => window.location.reload()}
                    className="w-full py-2.5 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors"
                 >
                    Обновить страницу
                 </button>
             </div>
        </div>
      );
    }

    return this.props.children;
  }
}