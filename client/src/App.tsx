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
import SeasonHub from './pages/season/SeasonHub';
import OffseasonFlow from './pages/season/OffseasonFlow';
import RecruitingHub from './pages/recruiting/RecruitingHub';
import YourBoard from './pages/recruiting/YourBoard';
import NationalBoard from './pages/recruiting/NationalBoard';
import CommitmentFeed from './pages/recruiting/CommitmentFeed';
import ClassSummary from './pages/recruiting/ClassSummary';
import PortalHub from './pages/portal/PortalHub';
import Marketplace from './pages/portal/Marketplace';
import ActivityFeed from './pages/portal/ActivityFeed';
import NILHub from './pages/nil/NILHub';
import BudgetContracts from './pages/nil/BudgetContracts';
import JealousyReport from './pages/nil/JealousyReport';
import Leaderboard from './pages/nil/Leaderboard';
import WeeklySchedule from './pages/games/WeeklySchedule';
import GameDetail from './pages/games/GameDetail';
import MySchedule from './pages/games/MySchedule';
import StandingsHub from './pages/standings/StandingsHub';
import ConferenceStandings from './pages/standings/ConferenceStandings';
import APPoll from './pages/rankings/APPoll';
import CoachesPoll from './pages/rankings/CoachesPoll';
import NETRankings from './pages/rankings/NETRankings';
import EfficiencyRatings from './pages/rankings/EfficiencyRatings';
import Bracketology from './pages/rankings/Bracketology';
import PostseasonHub from './pages/postseason/PostseasonHub';
import ConferenceTournament from './pages/postseason/ConferenceTournament';
import SelectionSunday from './pages/postseason/SelectionSunday';
import NCAATournament from './pages/postseason/NCAATournament';
import NITBracket from './pages/postseason/NITBracket';
import YourStaff from './pages/coaching/YourStaff';
import FitReport from './pages/coaching/FitReport';
import MoraleReport from './pages/coaching/MoraleReport';
import HotSeat from './pages/coaching/HotSeat';
import Carousel from './pages/coaching/Carousel';
import CoachingTree from './pages/coaching/CoachingTree';
import TeamSelectModal from './components/TeamSelectModal';

export default function App() {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1">
        <TopNav />
        <div className="p-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/season" element={<SeasonHub />} />
            <Route path="/season/offseason" element={<OffseasonFlow />} />

            <Route path="/recruiting" element={<RecruitingHub />} />
            <Route path="/recruiting/board" element={<YourBoard />} />
            <Route path="/recruiting/national" element={<NationalBoard />} />
            <Route path="/recruiting/feed" element={<CommitmentFeed />} />
            <Route path="/recruiting/class" element={<ClassSummary />} />

            <Route path="/portal" element={<PortalHub />} />
            <Route path="/portal/marketplace" element={<Marketplace />} />
            <Route path="/portal/feed" element={<ActivityFeed />} />

            <Route path="/nil" element={<NILHub />} />
            <Route path="/nil/contracts" element={<BudgetContracts />} />
            <Route path="/nil/jealousy" element={<JealousyReport />} />
            <Route path="/nil/leaderboard" element={<Leaderboard />} />

            <Route path="/games/week/:week" element={<WeeklySchedule />} />
            <Route path="/games/:gameId" element={<GameDetail />} />
            <Route path="/games/schedule" element={<MySchedule />} />

            <Route path="/standings" element={<StandingsHub />} />
            <Route path="/standings/:conferenceId" element={<ConferenceStandings />} />

            <Route path="/rankings/ap" element={<APPoll />} />
            <Route path="/rankings/coaches" element={<CoachesPoll />} />
            <Route path="/rankings/net" element={<NETRankings />} />
            <Route path="/rankings/efficiency" element={<EfficiencyRatings />} />
            <Route path="/rankings/bracketology" element={<Bracketology />} />

            <Route path="/postseason" element={<PostseasonHub />} />
            <Route path="/postseason/conference" element={<ConferenceTournament />} />
            <Route path="/postseason/selection" element={<SelectionSunday />} />
            <Route path="/postseason/ncaa" element={<NCAATournament />} />
            <Route path="/postseason/nit" element={<NITBracket />} />

            <Route path="/coaching/staff" element={<YourStaff />} />
            <Route path="/coaching/fit" element={<FitReport />} />
            <Route path="/coaching/morale" element={<MoraleReport />} />
            <Route path="/coaching/hotseat" element={<HotSeat />} />
            <Route path="/coaching/carousel" element={<Carousel />} />
            <Route path="/coaching/tree/:coachId" element={<CoachingTree />} />

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
      <TeamSelectModal />
    </div>
  );
}
