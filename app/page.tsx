""use client"; // This is important for client-side components in App Router

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function HomePage() {
  const [spec, setSpec] = useState(null);

  useEffect(() => {
    fetch('/swagger.json')
      .then((res) => res.json())
      .then((swaggerSpec) => {
        // Dynamically set the server URL
        const serverUrl = `${window.location.origin}/api`;
        swaggerSpec.servers = [{ url: serverUrl, description: 'Current environment' }];
        setSpec(swaggerSpec);
      });
  }, []);

  return (
    <div className="light" style={{ padding: '20px' }}>
      <h1>API Documentation</h1>
      {spec ? <SwaggerUI spec={spec} /> : <div>Loading...</div>}
    </div>
  );
}
