import React from 'react';
import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

function SwaggerPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>API Documentation</h1>
      <SwaggerUI url="/swagger.json" />
    </div>
  );
}

export default SwaggerPage;
