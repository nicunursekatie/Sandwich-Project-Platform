import { useQuery } from "@tanstack/react-query";
import { FileText, TrendingUp, Calendar, Award, Download, ExternalLink, Sandwich, Users, Building2, Target, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import SandwichCollectionForm from "@/components/sandwich-collection-form";
import { useAuth } from "@/hooks/useAuth";
import { hasPermission, PERMISSIONS } from "@shared/auth-utils";
import { HelpBubble } from "@/components/help-system/HelpBubble";
import sandwichLogo from "@assets/LOGOS/sandwich logo.png";

interface DashboardOverviewProps {
  onSectionChange: (section: string) => void;
}

export default function DashboardOverview({ onSectionChange }: { onSectionChange?: (section: string) => void }) {
  const { user } = useAuth();

  const { data: statsData } = useQuery({
    queryKey: ["/api/sandwich-collections/stats"],
    queryFn: async () => {
      const response = await fetch('/api/sandwich-collections/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
    staleTime: 0,
    refetchOnWindowFocus: true
  });

  const organizationalStats = {
    totalLifetimeSandwiches: statsData ? statsData.completeTotalSandwiches?.toLocaleString() : "Loading...",
    peakWeekRecord: "38,828",
    peakWeekDate: "November 15, 2023",
    currentAnnualCapacity: "~450,000",
    weeklyBaseline: "8,000",
    surgingCapacity: "25,000-40,000",
    operationalYears: "5",
    totalCollections: statsData?.totalEntries || 0,
    activeHosts: 25,
    totalRecipients: 23
  };

  return (
    <div style={{ 
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      backgroundColor: '#F8F6F3',
      minHeight: '100vh',
      padding: '24px'
    }}>
      {/* Header Section */}
      <div style={{
        marginBottom: '32px',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #236383 0%, #1E4F6F 100%)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '20px',
            boxShadow: '0 6px 24px rgba(35, 99, 131, 0.25)'
          }}>
            <img src={sandwichLogo} alt="The Sandwich Project" style={{ width: '40px', height: '40px' }} />
          </div>
          <div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '600',
              color: '#2C3E50',
              margin: '0',
              lineHeight: '1.2'
            }}>
              The Sandwich Project
            </h1>
            <p style={{
              fontSize: '16px',
              color: '#7F8C8D',
              margin: '4px 0 0 0',
              fontWeight: '400'
            }}>
              Community Impact Dashboard
            </p>
          </div>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* Hero Impact Card */}
        <div style={{
          background: 'linear-gradient(135deg, #236383 0%, #1E4F6F 100%)',
          borderRadius: '16px',
          padding: '20px',
          color: 'white',
          boxShadow: '0 6px 24px rgba(35, 99, 131, 0.12)',
          border: '1px solid rgba(35, 99, 131, 0.15)',
          gridColumn: 'span 2'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <Sandwich style={{ width: '24px', height: '24px', marginRight: '12px' }} />
            <span style={{
              fontSize: '14px',
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              opacity: '0.9'
            }}>
              Total Impact
            </span>
          </div>
          <div style={{
            fontSize: '72px',
            fontWeight: '800',
            lineHeight: '1',
            marginBottom: '8px'
          }}>
            {organizationalStats.totalLifetimeSandwiches}
          </div>
          <div style={{
            fontSize: '16px',
            opacity: '0.9',
            fontWeight: '400'
          }}>
            Sandwiches provided to our community
          </div>
        </div>

        {/* Gold Accent Card - Weekly Capacity */}
        <div style={{
          background: '#FBAD3F',
          borderRadius: '16px',
          padding: '20px',
          color: 'white',
          boxShadow: '0 6px 24px rgba(251, 173, 63, 0.12)',
          border: '1px solid rgba(251, 173, 63, 0.15)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <TrendingUp style={{ width: '20px', height: '20px', marginRight: '10px' }} />
            <span style={{
              fontSize: '14px',
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Weekly Output
            </span>
          </div>
          <div style={{
            fontSize: '36px',
            fontWeight: '700',
            lineHeight: '1.1',
            marginBottom: '4px'
          }}>
            {organizationalStats.weeklyBaseline}
          </div>
          <div style={{
            fontSize: '14px',
            opacity: '0.9',
            fontWeight: '400'
          }}>
            Average per week
          </div>
        </div>
      </div>

      {/* Secondary Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* Collections Card */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 6px 24px rgba(35, 99, 131, 0.12)',
          border: '1px solid rgba(35, 99, 131, 0.15)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <Calendar style={{ width: '20px', height: '20px', color: '#236383', marginRight: '10px' }} />
            <span style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#7F8C8D',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Collections
            </span>
          </div>
          <div style={{
            fontSize: '36px',
            fontWeight: '700',
            color: '#2C3E50',
            lineHeight: '1.1',
            marginBottom: '4px'
          }}>
            {organizationalStats.totalCollections.toLocaleString()}
          </div>
          <div style={{
            fontSize: '14px',
            color: '#7F8C8D',
            fontWeight: '400'
          }}>
            Total entries
          </div>
        </div>

        {/* Active Hosts Card */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 6px 24px rgba(35, 99, 131, 0.12)',
          border: '1px solid rgba(35, 99, 131, 0.15)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <Building2 style={{ width: '20px', height: '20px', color: '#2D5A2D', marginRight: '10px' }} />
            <span style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#7F8C8D',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Host Sites
            </span>
          </div>
          <div style={{
            fontSize: '36px',
            fontWeight: '700',
            color: '#2C3E50',
            lineHeight: '1.1',
            marginBottom: '4px'
          }}>
            {organizationalStats.activeHosts}
          </div>
          <span style={{
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            textTransform: 'uppercase',
            background: '#2D5A2D',
            color: 'white'
          }}>
            Active
          </span>
        </div>

        {/* Recipients Card */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 6px 24px rgba(35, 99, 131, 0.12)',
          border: '1px solid rgba(35, 99, 131, 0.15)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <Users style={{ width: '20px', height: '20px', color: '#E67E22', marginRight: '10px' }} />
            <span style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#7F8C8D',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Recipients
            </span>
          </div>
          <div style={{
            fontSize: '36px',
            fontWeight: '700',
            color: '#2C3E50',
            lineHeight: '1.1',
            marginBottom: '4px'
          }}>
            {organizationalStats.totalRecipients}
          </div>
          <span style={{
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            textTransform: 'uppercase',
            background: '#E67E22',
            color: 'white'
          }}>
            Serving
          </span>
        </div>

        {/* Peak Performance Card */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 6px 24px rgba(35, 99, 131, 0.12)',
          border: '1px solid rgba(35, 99, 131, 0.15)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <Target style={{ width: '20px', height: '20px', color: '#FBAD3F', marginRight: '10px' }} />
            <span style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#7F8C8D',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Peak Week
            </span>
          </div>
          <div style={{
            fontSize: '36px',
            fontWeight: '700',
            color: '#2C3E50',
            lineHeight: '1.1',
            marginBottom: '4px'
          }}>
            {organizationalStats.peakWeekRecord}
          </div>
          <span style={{
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            textTransform: 'uppercase',
            background: '#FBAD3F',
            color: 'white'
          }}>
            Record
          </span>
        </div>
      </div>

      {/* Action Cards Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* Data Entry Card */}
        {hasPermission(user, PERMISSIONS.CREATE_COLLECTIONS) && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 6px 24px rgba(35, 99, 131, 0.12)',
            border: '1px solid rgba(35, 99, 131, 0.15)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <Activity style={{ width: '24px', height: '24px', color: '#236383', marginRight: '12px' }} />
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#2C3E50',
                margin: '0'
              }}>
                Record Collection Data
              </h3>
            </div>
            <p style={{
              fontSize: '14px',
              color: '#7F8C8D',
              marginBottom: '20px',
              lineHeight: '1.5'
            }}>
              Submit your weekly sandwich collection totals and group contributions.
            </p>
            <SandwichCollectionForm />
          </div>
        )}

        {/* Quick Actions Card */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 6px 24px rgba(35, 99, 131, 0.12)',
          border: '1px solid rgba(35, 99, 131, 0.15)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <Award style={{ width: '24px', height: '24px', color: '#FBAD3F', marginRight: '12px' }} />
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#2C3E50',
              margin: '0'
            }}>
              Quick Actions
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Button
              onClick={() => onSectionChange?.('collections')}
              style={{
                background: '#236383',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#1E4F6F'}
              onMouseOut={(e) => e.currentTarget.style.background = '#236383'}
            >
              View All Collections
            </Button>
            <Button
              onClick={() => onSectionChange?.('analytics')}
              style={{
                background: '#FBAD3F',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 16px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#e89b2e'}
              onMouseOut={(e) => e.currentTarget.style.background = '#FBAD3F'}
            >
              Analytics Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Help System Integration */}
      <HelpBubble
        title="Dashboard Overview"
        content="Your central hub for organizational metrics and quick actions. The main impact card shows total lifetime sandwiches served, while secondary metrics display current operational capacity and performance indicators."
        position="bottom-right"
      />
    </div>
  );
}