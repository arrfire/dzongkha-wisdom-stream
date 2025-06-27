
import React, { useEffect } from 'react';

const Web3Bhutan = () => {
  useEffect(() => {
    // Add Chart.js script
    const chartScript = document.createElement('script');
    chartScript.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    chartScript.onload = () => {
      initializeCharts();
    };
    document.head.appendChild(chartScript);

    return () => {
      // Cleanup script if component unmounts
      document.head.removeChild(chartScript);
    };
  }, []);

  const initializeCharts = () => {
    const vibrantPalette = {
      primary: '#0047AB',
      secondary: '#007FFF',
      accent: '#4169E1',
      light: '#ADD8E6',
      background: '#F0F8FF'
    };

    const tooltipConfig = {
      plugins: {
        tooltip: {
          callbacks: {
            title: function(tooltipItems: any) {
              const item = tooltipItems[0];
              let label = item.chart.data.labels[item.dataIndex];
              if (Array.isArray(label)) {
                return label.join(' ');
              } else {
                return label;
              }
            }
          },
          backgroundColor: 'rgba(0, 71, 171, 0.9)',
          titleFont: { size: 14, weight: 'bold' },
          bodyFont: { size: 12 },
          padding: 10,
          cornerRadius: 5,
          displayColors: false
        },
        legend: {
          labels: {
            color: vibrantPalette.primary,
            font: {
              size: 12
            }
          }
        }
      }
    };

    function wrapLabels(labels: string[], maxLength: number) {
      return labels.map(label => {
        if (label.length <= maxLength) {
          return label;
        }
        const words = label.split(' ');
        let currentLine = '';
        const lines = [];
        for (const word of words) {
          if ((currentLine + ' ' + word).trim().length > maxLength) {
            lines.push(currentLine.trim());
            currentLine = word;
          } else {
            currentLine = (currentLine + ' ' + word).trim();
          }
        }
        lines.push(currentLine.trim());
        return lines;
      });
    }

    // NDI Services Chart
    const ndiServicesCtx = (document.getElementById('ndiServicesChart') as HTMLCanvasElement)?.getContext('2d');
    if (ndiServicesCtx) {
      new (window as any).Chart(ndiServicesCtx, {
        type: 'doughnut',
        data: {
          labels: ['Services Integrated', 'Services Planned'],
          datasets: [{
            data: [40, 30],
            backgroundColor: [vibrantPalette.secondary, vibrantPalette.light],
            borderColor: [vibrantPalette.background],
            borderWidth: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          ...tooltipConfig,
          plugins: { 
            ...tooltipConfig.plugins,
            title: {
              display: false
            }
          },
          cutout: '60%'
        }
      });
    }

    // AI Challenges Chart
    const aiChallengesCtx = (document.getElementById('aiChallengesChart') as HTMLCanvasElement)?.getContext('2d');
    if (aiChallengesCtx) {
      const originalLabels = ['Shortage of Skilled AI Professionals', 'Limited Funding for R&D', 'Lack of Ethical AI Frameworks', 'Need for Clear Strategic Vision', 'Infrastructure & Data Quality Gaps'];
      new (window as any).Chart(aiChallengesCtx, {
        type: 'bar',
        data: {
          labels: wrapLabels(originalLabels, 16),
          datasets: [{
            label: 'Severity of Challenge (Illustrative)',
            data: [90, 85, 75, 70, 65],
            backgroundColor: [
              '#007FFF',
              '#1E90FF',
              '#4169E1',
              '#6495ED',
              '#ADD8E6'
            ],
            borderRadius: 5,
            borderColor: vibrantPalette.primary,
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          ...tooltipConfig,
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 127, 255, 0.1)'
              },
              ticks: { color: vibrantPalette.primary }
            },
            x: {
              grid: {
                display: false
              },
              ticks: { color: vibrantPalette.primary }
            }
          },
          plugins: {
            ...tooltipConfig.plugins,
            legend: {
              display: false
            }
          },
          indexAxis: 'y'
        }
      });
    }

    // AI Funding Chart
    const aiFundingCtx = (document.getElementById('aiFundingChart') as HTMLCanvasElement)?.getContext('2d');
    if (aiFundingCtx) {
      new (window as any).Chart(aiFundingCtx, {
        type: 'pie',
        data: {
          labels: ['Google.org Accelerator', 'Meta Llama Impact Grants', 'Other Corp. Philanthropy'],
          datasets: [{
            data: [45, 35, 20],
            backgroundColor: [vibrantPalette.secondary, vibrantPalette.accent, vibrantPalette.light],
            borderColor: [vibrantPalette.background],
            borderWidth: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          ...tooltipConfig
        }
      });
    }

    // Web3 Funding Chart
    const web3FundingCtx = (document.getElementById('web3FundingChart') as HTMLCanvasElement)?.getContext('2d');
    if (web3FundingCtx) {
      new (window as any).Chart(web3FundingCtx, {
        type: 'pie',
        data: {
          labels: ['Public Goods Grants (e.g., Octant)', 'Ecosystem Grants (e.g., Ethereum)', 'Protocol Specific Grants'],
          datasets: [{
            data: [50, 30, 20],
            backgroundColor: [vibrantPalette.secondary, vibrantPalette.accent, vibrantPalette.light],
            borderColor: [vibrantPalette.background],
            borderWidth: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          ...tooltipConfig
        }
      });
    }
  };

  return (
    <div className="bg-[#F0F8FF] text-[#0047AB] min-h-screen" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="container mx-auto p-4 md:p-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-extrabold text-[#0047AB] mb-4" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.1)' }}>
            Bhutan's Digital Dawn
          </h1>
          <p className="text-lg md:text-xl text-[#4169E1] max-w-3xl mx-auto">
            An infographic on the strategic convergence of Web3, AI, and Gross National Happiness in the Land of the Thunder Dragon.
          </p>
        </header>

        <main>
          {/* Vision Section */}
          <section id="vision" className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8 text-[#0047AB]">A Visionary Leap: Gelephu Mindfulness City</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-center">
              <div className="bg-gradient-to-br from-[#007FFF] to-[#0047AB] text-white p-8 rounded-2xl text-center">
                <p className="text-5xl font-extrabold">$100B</p>
                <p className="mt-2 text-lg font-medium">Project Investment</p>
              </div>
              <div className="bg-gradient-to-br from-[#007FFF] to-[#0047AB] text-white p-8 rounded-2xl text-center">
                <p className="text-5xl font-extrabold">2,500 km²</p>
                <p className="mt-2 text-lg font-medium">Special Administrative Region</p>
              </div>
              <div className="bg-gradient-to-br from-[#007FFF] to-[#0047AB] text-white p-8 rounded-2xl text-center">
                <p className="text-5xl font-extrabold">100%</p>
                <p className="mt-2 text-lg font-medium">Carbon Negative Energy</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-xl p-6 mt-8 hover:shadow-2xl transition-shadow duration-300">
              <p className="text-lg text-gray-700 leading-relaxed">
                The Gelephu Mindfulness City (GMC) is Bhutan's flagship project to create a global hub for innovation and sustainable development, rooted in the principles of Gross National Happiness (GNH 2.0). By leveraging its status as a Special Administrative Region and its abundant clean energy, GMC aims to attract "mindful businesses" and position itself as a world leader in the digital economy, even recognizing digital assets like BTC and ETH in its strategic reserves.
              </p>
            </div>
          </section>

          {/* NDI Section */}
          <section id="ndi" className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8 text-[#0047AB]">The Digital Spine: National Digital Identity (NDI)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="bg-white rounded-xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
                <h3 className="text-2xl font-bold mb-4 text-[#007FFF]">A World First</h3>
                <p className="text-lg text-gray-700 mb-6">
                  Bhutan is the first sovereign nation to roll out a decentralized, Self-Sovereign Identity (SSI) platform for all its citizens. Built on blockchain, the NDI empowers individuals with secure control over their personal data.
                </p>
                <div className="flex items-center space-x-4">
                  <span className="text-4xl">🔑</span>
                  <div>
                    <p className="font-bold text-xl text-[#0047AB]">Citizen-Centric Control</p>
                    <p className="text-gray-600">Secure, verifiable credentials for seamless access to services.</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
                <h3 className="text-2xl font-bold mb-4 text-[#007FFF]">Service Integration Status</h3>
                <div className="relative w-full max-w-lg mx-auto h-80">
                  <canvas id="ndiServicesChart"></canvas>
                </div>
                <p className="text-center mt-4 text-gray-600">
                  The NDI is already integrated with over 40 services, with ambitious plans for future expansion into areas like e-voting and air travel.
                </p>
              </div>
            </div>
          </section>

          {/* Ecosystem Section */}
          <section id="ecosystem" className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8 text-[#0047AB]">The Innovation Ecosystem</h2>
            <p className="text-center text-lg text-gray-700 max-w-3xl mx-auto mb-8">
              Bhutan's digital transformation is driven by a network of interconnected government agencies, state-owned enterprises, and private sector pioneers, all working towards a unified vision.
            </p>
            <div className="bg-white rounded-xl shadow-xl p-6">
              <div className="border-2 border-[#007FFF] bg-white text-[#0047AB] p-3 rounded-lg text-center font-semibold shadow-md">
                <p>Royal Government of Bhutan (Vision & Policy)</p>
              </div>
              <div className="relative w-full h-0.5 bg-[#007FFF] my-6">
                <div className="absolute bottom-[-12px] left-1/2 transform -translate-x-1/2 text-[#007FFF] text-2xl">▼</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="border-2 border-[#007FFF] bg-white text-[#0047AB] p-3 rounded-lg text-center font-semibold shadow-md">
                  GovTech Agency<br /><span className="font-normal text-sm">(WOG Transformation)</span>
                </div>
                <div className="border-2 border-[#007FFF] bg-white text-[#0047AB] p-3 rounded-lg text-center font-semibold shadow-md">
                  Druk Holding & Investments (DHI)<br /><span className="font-normal text-sm">(Investment & Innovation Arm)</span>
                </div>
                <div className="border-2 border-[#007FFF] bg-white text-[#0047AB] p-3 rounded-lg text-center font-semibold shadow-md">
                  Gelephu Mindfulness City (GMC)<br /><span className="font-normal text-sm">(SAR & Economic Hub)</span>
                </div>
              </div>
              <div className="relative w-full h-0.5 bg-[#007FFF] my-6">
                <div className="absolute bottom-[-12px] left-1/2 transform -translate-x-1/2 text-[#007FFF] text-2xl">▼</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="border-2 border-[#007FFF] bg-white text-[#0047AB] p-3 rounded-lg text-center font-semibold shadow-md">
                  Bhutan NDI<br /><span className="font-normal text-sm">(Decentralized Identity)</span>
                </div>
                <div className="border-2 border-[#007FFF] bg-white text-[#0047AB] p-3 rounded-lg text-center font-semibold shadow-md">
                  ORO Bank<br /><span className="font-normal text-sm">(Digital Finance & Crypto Payments)</span>
                </div>
              </div>
              <div className="relative w-full h-0.5 bg-[#007FFF] my-6">
                <div className="absolute bottom-[-12px] left-1/2 transform -translate-x-1/2 text-[#007FFF] text-2xl">▼</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="border-2 border-[#007FFF] bg-white text-[#0047AB] p-3 rounded-lg text-center font-semibold shadow-md">
                  Thimphu TechPark<br /><span className="font-normal text-sm">(Startup Incubation)</span>
                </div>
                <div className="border-2 border-[#007FFF] bg-white text-[#0047AB] p-3 rounded-lg text-center font-semibold shadow-md">
                  Royal University of Bhutan<br /><span className="font-normal text-sm">(Talent Development)</span>
                </div>
                <div className="border-2 border-[#007FFF] bg-white text-[#0047AB] p-3 rounded-lg text-center font-semibold shadow-md">
                  Private Sector (Startups & FDI)<br /><span className="font-normal text-sm">(Market Innovation)</span>
                </div>
              </div>
            </div>
          </section>

          {/* Challenges Section */}
          <section id="challenges" className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8 text-[#0047AB]">Bridging the AI Readiness Gap</h2>
            <div className="bg-white rounded-xl shadow-xl p-6">
              <p className="text-center text-lg text-gray-700 mb-6">
                The 2024 AI Readiness Assessment identified key challenges that Bhutan must address to realize its vision of an "AI-powered Bhutan". GovTech is already taking proactive steps to tackle these gaps.
              </p>
              <div className="relative w-full h-96">
                <canvas id="aiChallengesChart"></canvas>
              </div>
            </div>
          </section>

          {/* Funding Section */}
          <section id="funding" className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8 text-[#0047AB]">Funding the Future: Web3 & AI Opportunities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-xl p-6">
                <h3 className="text-2xl font-bold mb-4 text-[#007FFF]">AI for Social Impact</h3>
                <div className="relative w-full h-80">
                  <canvas id="aiFundingChart"></canvas>
                </div>
                <p className="mt-4 text-gray-700">
                  Global giants are launching multi-million dollar grant programs to support AI projects with social benefits in areas like education, healthcare, and community development, perfectly aligning with Bhutan's GNH principles.
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-xl p-6">
                <h3 className="text-2xl font-bold mb-4 text-[#007FFF]">Web3 for Public Goods</h3>
                <div className="relative w-full h-80">
                  <canvas id="web3FundingChart"></canvas>
                </div>
                <p className="mt-4 text-gray-700">
                  A new wave of decentralized funding models like Quadratic Funding and DAO-led grants are emerging, designed to support open-source and community-driven projects that traditional VCs often overlook.
                </p>
              </div>
            </div>
          </section>
        </main>

        <footer className="text-center mt-12 pt-8 border-t-2 border-[#ADD8E6]">
          <p className="text-[#0047AB]">
            &copy; 2025 Strategic Engagement Infographic. All data synthesized from "Strategic Engagement Opportunities in Bhutan's Web3 and AI Landscape."
          </p>
          <p className="text-sm text-gray-500 mt-2">
            This infographic was generated to visualize key data points and relationships for strategic planning.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Web3Bhutan;
