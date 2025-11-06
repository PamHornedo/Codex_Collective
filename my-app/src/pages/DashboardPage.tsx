import { Link } from "react-router-dom";

function Dashboard() {
    return (
    <div>
        <div>Dashboard</div>
        <div className="page-links">
            <div className="card">
                <Link to="/browse">Browse</Link>
            </div>
            <div className="card">
                <Link to="/mybooks">My Books</Link>
            </div>
            <div className="card">
                <Link to="/feed">My Feed</Link>
            </div>
            <div className="card">
                <Link to="/bookdetails">Book Details</Link>
            </div>
        </div>
    </div>
    );
}

export default Dashboard;