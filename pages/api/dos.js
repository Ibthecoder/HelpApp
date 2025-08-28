import Head from "next/head";
import Script from "next/script";

export default function ApiDocs() {
  return (
    <>
      <Head>
        <title>API Docs</title>
        <link
          rel="stylesheet"
          href="https://unpkg.com/swagger-ui-dist/swagger-ui.css"
        />
      </Head>

      {/* Swagger container */}
      <div id="swagger-ui" style={{ width: "100%", height: "100vh" }} />

      {/* Swagger JS bundles */}
      <Script
        src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"
        strategy="beforeInteractive"
      />
      <Script
        src="https://unpkg.com/swagger-ui-dist/swagger-ui-standalone-preset.js"
        strategy="beforeInteractive"
      />

      {/* Initialize Swagger UI */}
      <Script id="swagger-init" strategy="afterInteractive">
        {`
          window.onload = function() {
            window.ui = SwaggerUIBundle({
              url: "/swagger.json", // your hosted OpenAPI spec
              dom_id: "#swagger-ui",
              presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
              layout: "BaseLayout",
              deepLinking: true,
            });
          };
        `}
      </Script>
    </>
  );
}

// import swaggerUi from "swagger-ui-express";
// import fs from "fs";
// import path from "path";

// // Disable Next.js bodyParser for this route
// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// const swaggerFile = path.join(process.cwd(), "swagger.json");
// const swaggerDocument = JSON.parse(fs.readFileSync(swaggerFile, "utf-8"));

// export default function handler(req, res) {
//   if (req.method === "GET") {
//     res.setHeader("Content-Type", "text/html");
//     res.send(swaggerUi.generateHTML(swaggerDocument));
//   } else {
//     res.status(405).end();
//   }
// }
