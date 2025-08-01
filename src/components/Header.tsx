import { Building2, Settings } from "lucide-react";
import { Link } from "react-router-dom";
const Header = () => {
  return <header className="bg-header-bg text-header-foreground py-6 px-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-center">
          <img 
            src="/lovable-uploads/e952505a-6ba3-468e-a269-0a74e7fbdd8e.png" 
            alt="Logo" 
            className="h-12"
          />
        </div>
      </div>
    </header>;
};
export default Header;