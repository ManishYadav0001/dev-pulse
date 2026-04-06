import { useOutletContext } from "react-router-dom";
import RepoInsights from "../../components/dashboard/RepoInsights.jsx";

export default function Repos() {
  const { dashboard, loading, error } = useOutletContext();

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-[#0b1220] p-8 text-center text-slate-300">
        Loading repositories...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-700/50 bg-rose-900/10 p-8 text-center text-rose-200">
        {error}
      </div>
    );
  }

  if (dashboard?.noData) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-[#0b1220] p-8 text-center text-slate-300">
        {dashboard.message || "No Data Found. Please connect GitHub to continue."}
      </div>
    );
  }

  return <RepoInsights repositories={dashboard?.repositories || []} />;
}

