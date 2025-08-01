import { Building2 } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-header-bg text-header-foreground py-6 px-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-center md:justify-start">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8" />
            <span className="text-2xl font-bold tracking-wider">V4 COMPANY</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;