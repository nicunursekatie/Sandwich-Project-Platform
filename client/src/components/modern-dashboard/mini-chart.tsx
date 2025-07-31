interface MiniChartProps {
  data: number[];
  color?: string;
  type?: 'line' | 'bar' | 'area';
  className?: string;
}

export function MiniChart({ 
  data, 
  color = 'var(--tsp-primary)', 
  type = 'line',
  className = ""
}: MiniChartProps) {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const normalizedData = data.map(value => ((value - min) / range) * 100);
  
  const width = 100;
  const height = 40;
  const padding = 2;

  const generatePath = () => {
    const stepX = (width - padding * 2) / (data.length - 1);
    
    return normalizedData.map((value, index) => {
      const x = padding + index * stepX;
      const y = height - padding - (value * (height - padding * 2)) / 100;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  const generateBars = () => {
    const barWidth = (width - padding * 2) / data.length - 1;
    
    return normalizedData.map((value, index) => {
      const x = padding + index * (barWidth + 1);
      const barHeight = (value * (height - padding * 2)) / 100;
      const y = height - padding - barHeight;
      
      return (
        <rect
          key={index}
          x={x}
          y={y}
          width={barWidth}
          height={barHeight}
          fill={color}
          opacity={0.7}
          rx={1}
        />
      );
    });
  };

  const generateArea = () => {
    const stepX = (width - padding * 2) / (data.length - 1);
    
    const topPath = normalizedData.map((value, index) => {
      const x = padding + index * stepX;
      const y = height - padding - (value * (height - padding * 2)) / 100;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
    
    const bottomPath = `L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`;
    
    return topPath + bottomPath;
  };

  return (
    <div className={`mini-chart ${className}`}>
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id={`gradient-${type}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{stopColor: color, stopOpacity: 0.8}} />
            <stop offset="100%" style={{stopColor: color, stopOpacity: 0.2}} />
          </linearGradient>
        </defs>
        
        {type === 'line' && (
          <path
            d={generatePath()}
            stroke={color}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        
        {type === 'bar' && generateBars()}
        
        {type === 'area' && (
          <path
            d={generateArea()}
            fill={`url(#gradient-${type})`}
            stroke={color}
            strokeWidth={1}
          />
        )}
      </svg>
    </div>
  );
}