# Patra - Identity in Motion

<div align="center">
  <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop" alt="Patra Banner" width="100%" height="300" style="object-fit: cover; border-radius: 10px;">
  
  <h1>Patra</h1>
  <p><strong>Premium Digital Business Cards & NFC Integration</strong></p>

  [![React](https://img.shields.io/badge/React-18.3-blue?logo=react)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-5.4-purple?logo=vite)](https://vitejs.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)](https://www.typescriptlang.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-Database-green?logo=supabase)](https://supabase.com/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-cyan?logo=tailwindcss)](https://tailwindcss.com/)
  [![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
</div>

---

## 🚀 Overview

**Patra** is a cutting-edge platform for creating, managing, and sharing premium digital business cards. Designed for the modern professional, Patra combines the physical utility of NFC technology with the boundless flexibility of the web.

Whether you are an entrepreneur, a creative, or a corporate executive, Patra ensures your first impression is unforgettable.

## ✨ Key Features

- **🎨 Intuitive Editor**: Drag-and-drop interface to customize your profile, links, and gallery.
- **🤖 AI-Powered**: Generate bios and optimize your profile with integrated AI tools.
- **📱 NFC Ready**: Seamlessly write your digital profile URL to NFC cards for instant sharing.
- **📊 Analytics**: Track views, clicks, and engagement with detailed insights.
- **🔒 Secure & Private**: Enterprise-grade security with optional password protection and sensitive content controls.
- **🌍 Custom Domains**: (Coming Soon) Connect your own domain for a fully branded experience.
- **📱 PWA Support**: Installable on iOS and Android for a native app experience.

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, Shadcn UI, Framer Motion
- **Backend / Database**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **State Management**: React Query, Context API
- **Maps**: Leaflet / React-Leaflet

## 📂 Project Structure

```bash
src/
├── components/        # Reusable UI components (Shadcn + Custom)
├── contexts/          # Global state (Auth, Theme)
├── hooks/             # Custom React hooks
├── integrations/      # Third-party integrations (Supabase)
├── lib/               # Utility functions and helpers
├── pages/             # Route components (Editor, Profile, Dashboard)
└── types/             # TypeScript definitions
```

## 🚀 Getting Started

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/patra.git
    cd patra
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory and add your Supabase credentials:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```

## 📖 Documentation

We have detailed documentation available for specific improvements and architectural decisions:

- [Architecture & Refactoring](./docs/ARCHITECTURE_REFACTOR.md)
- [SEO & Social Sharing](./docs/SEO_AND_SHARING.md)
- [Security Audit](./docs/SECURITY_AUDIT.md)
- [Performance & UX](./docs/PERFORMANCE_AND_UX.md)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <p>Built with ❤️ by the Patra Team</p>
</div>
