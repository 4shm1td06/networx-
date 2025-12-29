
import React from 'react';
import { Loader2 } from 'lucide-react';

export const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
      <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
);

export const ButtonLoader = ({ children }: { children: React.ReactNode }) => (
  <>
    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
    {children}
  </>
);

export const ConnectionsLoader = () => (
  <div className="space-y-3">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="flex items-center space-x-3 p-3 border rounded-lg animate-pulse">
        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    ))}
  </div>
);

export const MessagesLoader = () => (
  <div className="space-y-4 p-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
        <div className="max-w-xs">
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-3 bg-gray-100 rounded mt-1 w-16 animate-pulse"></div>
        </div>
      </div>
    ))}
  </div>
);
