import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MyTrips from './pages/MyTrips';
import CreateTrip from './pages/CreateTrip';
import ItineraryBuilder from './pages/ItineraryBuilder';
import TripCalendar from './pages/TripCalendar';
import TripBudget from './pages/TripBudget';
import Settings from './pages/Settings';
import AdminPanel from './pages/AdminPanel';
import ActivitySearch from './pages/ActivitySearch';
import CommunitySearch from './pages/CommunitySearch';
import SharedItinerary from './pages/SharedItinerary';
import CitySearch from './pages/CitySearch';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login - no layout wrapper */}
        <Route path="/" element={<Login />} />

        {/* All app pages - with sidebar/nav layout */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/trips" element={<MyTrips />} />
          <Route path="/trips/create" element={<CreateTrip />} />
          <Route path="/trips/:id/itinerary" element={<ItineraryBuilder />} />
          <Route path="/trips/:id/calendar" element={<TripCalendar />} />
          <Route path="/trips/:id/budget" element={<TripBudget />} />
          <Route path="/activities" element={<ActivitySearch />} />
          <Route path="/community" element={<CommunitySearch />} />
          <Route path="/shared-itinerary/:id" element={<SharedItinerary />} />
          <Route path="/shared-itinerary" element={<SharedItinerary />} />
          <Route path="/cities" element={<CitySearch />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
