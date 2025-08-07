import { Layout } from "@/components/Layout";
import StepIntroduction from "@/components/StepIntroduction"; 
import ProductPortfolio from "@/components/ProductPortfolio";
import StatusReport from "@/components/StatusReport";

const Index = () => {
  return (
    <Layout showSidebar={true}>
      <div className="space-y-8 animate-fade-in">
        <StepIntroduction />
        <ProductPortfolio />
        <StatusReport />
      </div>
    </Layout>
  );
};

export default Index;
