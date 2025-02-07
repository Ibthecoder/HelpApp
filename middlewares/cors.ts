import { NextRequest, NextResponse } from 'next/server';

export function withCORS(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    const response = await handler(request, ...args);

    // Set CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*'); // Allow all origins for now, refine later
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return NextResponse.json({}, { status: 200, headers: response.headers });
    }

    return response;
  };
}
