"use client"; // This is important for client-side components in App Router

import React from 'react';
import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function HomePage() {
  return (
    <div className="light" style={{ padding: '20px' }}> {/* Added className="light" for potential light mode override */} 
      <h1>API Documentation</h1>
      <SwaggerUI url="/swagger.json" />
    </div>
  );
}