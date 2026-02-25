import { Navigate, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import Dashboard from './pages/Dashboard';
import TeamsList from './pages/TeamsList';
import TeamDetail from './pages/TeamDetail';
import ConferencesList from './pages/ConferencesList';
import ConferenceDetail from './pages/ConferenceDetail';
import PlayersList from './pages/PlayersList';
import PlayerDetail from './pages/PlayerDetail';
import CoachesList from './pages/CoachesList';
import CoachDetail from './pages/CoachDetail';
import RecruitBoard from './pages/RecruitBoard';
import RecruitDetail from './pages/RecruitDetail';
import SearchPage from './pages/Search';

export default function App() {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1">
        <TopNav />
        <div className="p-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/teams" element={<TeamsList />} />
            <Route path="/teams/:id" element={<TeamDetail />} />
            <Route path="/conferences" element={<ConferencesList />} />
            <Route path="/conferences/:id" element={<ConferenceDetail />} />
            <Route path="/players" element={<PlayersList />} />
            <Route path="/players/:id" element={<PlayerDetail />} />
            <Route path="/coaches" element={<CoachesList />} />
            <Route path="/coaches/:id" element={<CoachDetail />} />
            <Route path="/recruits" element={<RecruitBoard />} />
            <Route path="/recruits/:id" element={<RecruitDetail />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
