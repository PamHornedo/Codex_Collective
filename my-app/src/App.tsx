import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/DashboardPage";
import Browse from "./pages/BrowsePage";
import MyBooks from "./pages/MyBooksPage";
import Feed from "./pages/FeedPage";
import BookDetails from "./pages/BookDetailsPage";

function App() {
  return (
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/mybooks" element={<MyBooks />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/bookdetails" element={<BookDetails />} />
      </Routes>
  );
}

export default App;
