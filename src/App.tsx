import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import { Auth } from "./pages/Auth";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ResetPassword } from "./pages/ResetPassword";
import { Dashboard } from "./pages/Dashboard";
import { OnboardingNew } from "./pages/OnboardingNew";
import { Analytics } from "./pages/Analytics";
import { EditorNew } from "./pages/EditorNew";
import { PublicProfile } from "./pages/PublicProfile";
import { MyCard } from "./pages/mycard";
import { EmailSignature } from "./pages/EmailSignature";
import { ApiDocs } from "./pages/ApiDocs";
import { Settings } from "./pages/Settings";
import { Docs } from "./pages/Docs";
import NotFound from "./pages/NotFound";
import AIChat from "./pages/AIChat";
import { Templates } from "./pages/Templates";
// import PrintCard from "./pages/Printcard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <OnboardingNew />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/editor"
              element={
                <ProtectedRoute>
                  <EditorNew />
                </ProtectedRoute>
              }
            />
            <Route
              path="/email-signature"
              element={
                <ProtectedRoute>
                  <EmailSignature />
                </ProtectedRoute>
              }
            />
            <Route path="/api-docs" element={<ApiDocs />} />
            <Route path="/docs" element={<Docs />} />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/templates"
              element={
                <ProtectedRoute>
                  <Templates />
                </ProtectedRoute>
              }
            />

            {/* <Route
              path="/printcard"
              element={
                <ProtectedRoute>
                  <PrintCard />
                </ProtectedRoute>
              }
            /> */}
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="/:username/ai" element={<AIChat />} />
            <Route path="/:username" element={<PublicProfile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
