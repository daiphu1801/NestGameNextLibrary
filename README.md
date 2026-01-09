# NestGame Library 🎮

A modern, high-performance NES (Nintendo Entertainment System) Emulator and Game Library built with the latest web technologies. Experience classic retro games directly in your browser with a sleek, cyberpunk-inspired interface.

![NestGame Preview](public/screenshot.png)

## ✨ Features

*   **🕹️ Browser-based NES Emulator**: Powered by `nostalgist.js` for smooth, accurate emulation.
*   **🎨 Modern UI/UX**: Stunning interface with glassmorphism, animated gradients, and full Dark/Light mode support.
*   **⚡ Instant Play**: Click and play immediately. No downloads or complex setup required.
*   **📂 Drag & Drop Support**: Drop your own `.nes` or `.zip` ROMs to play instantly.
*   **💾 Save & Load**: Save your game progress locally (or cloud - configurable) and resume anytime.
*   **🌍 Multi-language**: Full support for English and Vietnamese.
*   **🔍 Smart Search**: Real-time search with hot keywords (Mario, Contra...) and advanced filtering by category/genre.
*   **📱 Responsive Design**: Fully optimized for desktop, tablet, and mobile devices.

## 🛠️ Tech Stack

*   **Framework**: [Next.js 16](https://nextjs.org/) (App Router & Server Components)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) + Custom CSS Animations
*   **State Management**: [Zustand](https://github.com/pmndrs/zustand)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **Emulation Core**: [Nostalgist.js](https://nostalgist.js.org/)
*   **Deployment**: Vercel

## 🚀 Getting Started

### Prerequisites

*   Node.js 18.17 or later
*   npm or yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/nest-game-next.git
    cd nest-game-next
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  **Open your browser:**
    Navigate to [http://localhost:3000](http://localhost:3000) to see the app running.

## 📦 Building for Production

To create an optimized production build:

```bash
npm run build
npm start
```

## ☁️ Deployment

This project is optimized for deployment on **Vercel**.

1.  Push your code to a GitHub repository.
2.  Import the project in [Vercel Dashboard](https://vercel.com/new).
3.  Vercel will detect Next.js and configure the build settings automatically.
4.  Click **Deploy**.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Note: This project is an emulator frontend. Users must provide their own game ROMs if they are not included in the demo library.*
