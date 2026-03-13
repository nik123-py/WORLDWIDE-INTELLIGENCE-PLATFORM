# AEGIS Worldwide Intelligence Platform

![AEGIS Platform Interface](https://via.placeholder.com/1200x600/050a18/00d4ff?text=AEGIS+Worldwide+Intelligence+Platform)

AEGIS is a state-of-the-art, 3D WebGL-powered global intelligence and surveillance dashboard. Designed with a premium dark "glassmorphism" aesthetic, it aggregates and visualizes critical worldwide data streams in real-time on an interactive 3D globe.

## Core Features

- **Interactive 3D WebGL Globe**: Powered by `react-globe.gl` and Three.js, offering hardware-accelerated rendering of thousands of concurrent data points with smooth pan/zoom controls.
- **Multi-Layer Data Visualization**:
  - ✈️ **Aircraft Flight Tracking**: Live military and private aircraft positions.
  - 🚢 **Maritime Monitoring**: Cargo and military vessel tracking, including "Dark Ship" detection (AIS transponder spoofing/disabling).
  - 🛰️ **Satellite Orbits**: Real-time tracking of communications, military, and navigation satellites.
  - 🌍 **Global Events & Threats**: Live mapping of earthquakes, storms, conflicts, and protests with pulsing severity rings.
  - 💥 **Cyber Warfare Visualization**: Animated arcs tracking global cyber-attack origins and targets.
  - 🏭 **Critical Infrastructure**: Mapping of nuclear plants, pipelines, military bases, and submarine cables.
  - 💰 **Financial Flows**: Tracking of large-scale international transactions and potential sanction violations.
- **Live Global CCTV Feed Integration**: 
  - Access to hundreds of live, public traffic and city cameras worldwide via Insecam.
  - Built-in Next.js proxy server to seamlessly bypass strict CORS and `X-Frame-Options` embedding restrictions.
- **"Minority Report" UI Interface**: Highly classified aesthetic with custom timeline controls, active alert feeds, and dynamic data filtering.

## Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 18)
- **3D Rendering**: [react-globe.gl](https://globe.gl/) / [Three.js](https://threejs.org/)
- **Language**: TypeScript
- **Styling**: Custom CSS with CSS Variables (Glassmorphism design system)
- **Icons**: Lucide React
- **Backend API**: Next.js Serverless Route Handlers (API Proxy)

## Getting Started Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/nik123-py/AEGIS-WORLDWIDE-INTELLIGENCE-PLATFORM.git
   cd AEGIS-WORLDWIDE-INTELLIGENCE-PLATFORM
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to view the platform.

## Deployment to Production

This project is optimized for zero-config deployment on **Vercel**, which natively supports the Next.js API proxy routes required for the CCTV streams.

1. Push your code to GitHub.
2. Link your repository to [Vercel](https://vercel.com/).
3. Vercel will automatically build (`npm run build`) and deploy both the static 3D frontend and the serverless API proxy.

---
*Note: This platform is a demonstration of data visualization techniques and UI/UX design. All "live" intel data is simulated or aggregated from public open-source intelligence (OSINT) and webcam APIs.*

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
