import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import LoginPage from "./pages/Login";
import HomePage from "./pages/HomePage";
import Navbar from "./components/Navbar";
import BookingPage from "./pages/BookingPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import RegisterPage from "./pages/RegisterPage";
import PublicOnlyRoute from "./components/PublicOnlyRoute";
import EventDetailsPage from "./pages/EventDetailsPage";
import CheckoutPage from "./pages/CheckOutPage";
import DashboardPage from "./pages/DashboardPage";
import SearchPage from "./pages/SearchPage";
import EventsPage from "./pages/EventsPage";

function App() {
  return (
    <div className="bg-slate-950 min-h-screen">
      <Navbar />

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#1e293b', // Slate-800 background
            color: '#fff',          // White text
            border: '1px solid rgba(255,255,255,0.1)', // Subtle border
            padding: '16px',
            borderRadius: '12px',
            fontSize: '14px',
            maxWidth: '500px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)', // Deep shadow
          },
          success: {
            iconTheme: {
              primary: '#6366f1', // Indigo-500 (Matches your brand)
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444', // Red-500
              secondary: '#fff',
            },
          },
        }}
      />

      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<HomePage />} />
        <Route element={<PublicOnlyRoute />} >
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route
          path="/event/:id"
          element={
            <ProtectedRoute>
              <EventDetailsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/event/:id/booking"
          element={
            <ProtectedRoute>
              <BookingPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route path="/search"
          element={
            <ProtectedRoute>
              <SearchPage />
            </ProtectedRoute>
          }
        />

        <Route path="/events"
          element={
            <ProtectedRoute>
              <EventsPage />
            </ProtectedRoute>
          }
        />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
