import { Building2, Settings } from "lucide-react";
import { Link } from "react-router-dom";
const Header = () => {
  return <header className="bg-header-bg text-header-foreground py-6 px-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Building2 size={32} />
            <h1 className="text-2xl font-bold">STEP Framework</h1>
          </div>
        </div>
      </div>
    </header>;
};
export default Header;