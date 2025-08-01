import { Building2, Settings } from "lucide-react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="bg-header-bg text-header-foreground py-6 px-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <Building2 className="h-8 w-8" />
            <span className="text-2xl font-bold">V4 Company</span>
          </Link>
          
          <Link 
            to="/admin" 
            className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-white/10 transition-colors"
          >
            <Settings className="h-5 w-5" />
            <span>Admin</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
export default Header;