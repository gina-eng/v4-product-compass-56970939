import { Layout } from "@/components/Layout";
import StepIntroduction from "@/components/StepIntroduction"; 
import ProductPortfolio from "@/components/ProductPortfolio";

const Index = () => {
  return (
    <Layout showHeader={true}>
      <div className="space-y-8 animate-fade-in">
        <StepIntroduction />
        <ProductPortfolio />
      </div>
    </Layout>
  );
};

export default Index;
