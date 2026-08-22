import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Login           from './pages/Login';
import Dashboard       from './pages/Dashboard';
import MyTrips         from './pages/MyTrips';
import CreateTrip      from './pages/CreateTrip';
import ItineraryBuilder from './pages/ItineraryBuilder';
import AddStop         from './pages/AddStop';
import TripCalendar    from './pages/TripCalendar';
import TripBudget      from './pages/TripBudget';
import CommunitySearch from './pages/CommunitySearch';
import SharedItinerary from './pages/SharedItinerary';
import CitySearch      from './pages/CitySearch';
import Settings        from './pages/Settings';
import AdminPanel      from './pages/AdminPanel';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public — redirect to /dashboard if already logged in */}
          <Route path="/" element={<Login />} />

          {/* All protected pages — require authentication */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard"                        element={<Dashboard />} />
            <Route path="/trips"                            element={<MyTrips />} />
            <Route path="/trips/create"                     element={<CreateTrip />} />
            <Route path="/trips/:id/itinerary"              element={<ItineraryBuilder />} />
            <Route path="/trips/:id/itinerary/add-stop"     element={<AddStop />} />
            <Route path="/trips/:id/calendar"               element={<TripCalendar />} />
            <Route path="/trips/:id/budget"                 element={<TripBudget />} />
            <Route path="/community"                        element={<CommunitySearch />} />
            <Route path="/shared-itinerary/:id"             element={<SharedItinerary />} />
            <Route path="/shared-itinerary"                 element={<SharedItinerary />} />
            <Route path="/cities"                           element={<CitySearch />} />
            <Route path="/settings"                         element={<Settings />} />
            <Route path="/admin"                            element={<AdminPanel />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
