import Header from "@/components/Header";
import StepIntroduction from "@/components/StepIntroduction"; 
import ProductPortfolio from "@/components/ProductPortfolio";
import StatusReport from "@/components/StatusReport";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <StepIntroduction />
      <ProductPortfolio />
      <StatusReport />
    </div>
  );
};

export default Index;
