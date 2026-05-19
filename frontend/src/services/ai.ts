// import axios from 'axios';

export interface AIRecommendation {
  signal: 'ROTATE' | 'HOLD' | 'COMPOUND';
  confidence: number;
  summary: string;
  from_asset: 'USDY' | 'mETH';
  to_asset: 'USDY' | 'mETH';
  suggested_pct_shift: number;
  risk_note: string;
}

export interface RiskAnalysis {
  score: number;
  level: 'Low' | 'Moderate' | 'High';
  nansen_modifier: number;
  elfa_sentiment: number;
}

const MOCK_RECOMMENDATION: AIRecommendation = {
  signal: 'ROTATE',
  confidence: 94,
  summary: "Mantle ecosystem shows a 12% increase in RWA TVL. While USDY yield remains stable, mETH rewards are trending upwards. Suggesting a 15% rotation to mETH.",
  from_asset: 'USDY',
  to_asset: 'mETH',
  suggested_pct_shift: 15,
  risk_note: "Volatility in mETH fluctuates based on network activity."
};

export const fetchAIRecommendation = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _walletAddress: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _riskProfile: any
): Promise<AIRecommendation> => {
  // In a real implementation, this would call the Tencent SCF proxy
  // return axios.get(`/api/groq-proxy?address=${_walletAddress}`);
  
  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  return MOCK_RECOMMENDATION;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const fetchRiskAnalysis = async (_asset: string): Promise<RiskAnalysis> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    score: 18,
    level: 'Low',
    nansen_modifier: -5,
    elfa_sentiment: 0.82
  };
};
