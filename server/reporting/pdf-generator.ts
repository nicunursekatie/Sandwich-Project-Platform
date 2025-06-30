import * as pdf from 'html-pdf-node';
import { ReportData } from './report-generator';

export class PDFGenerator {
  static async generatePDF(reportData: ReportData): Promise<Buffer> {
    const html = this.generateHTML(reportData);
    
    const options = {
      format: 'A4',
      margin: {
        top: '20mm',
        bottom: '20mm',
        left: '15mm',
        right: '15mm'
      },
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 10px; margin-left: 15mm; color: #666;">
          ${reportData.metadata.title}
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 10px; margin-left: 15mm; color: #666; width: 100%; text-align: center;">
          Generated on ${new Date(reportData.metadata.generatedAt).toLocaleDateString()} - Page <span class="pageNumber"></span> of <span class="totalPages"></span>
        </div>
      `
    };

    try {
      const pdfBuffer = await pdf.generatePdf({ content: html }, options);
      return pdfBuffer as Buffer;
    } catch (error) {
      console.error('PDF generation failed:', error);
      throw new Error('Failed to generate PDF');
    }
  }

  private static generateHTML(reportData: ReportData): string {
    const { metadata, summary, data, charts } = reportData;
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${metadata.title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            line-height: 1.6;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #236383;
        }
        .header h1 {
            color: #236383;
            margin-bottom: 10px;
            font-size: 28px;
        }
        .header .subtitle {
            color: #666;
            font-size: 16px;
        }
        .summary {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .summary h2 {
            color: #236383;
            margin-top: 0;
            margin-bottom: 15px;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        .stat-card {
            background: white;
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid #236383;
        }
        .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #236383;
        }
        .stat-label {
            color: #666;
            font-size: 14px;
        }
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .data-table th {
            background: #236383;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
        }
        .data-table td {
            padding: 10px 12px;
            border-bottom: 1px solid #e1e5e9;
        }
        .data-table tr:nth-child(even) {
            background: #f8f9fa;
        }
        .chart-section {
            margin-bottom: 30px;
        }
        .chart-title {
            color: #236383;
            font-size: 18px;
            margin-bottom: 15px;
        }
        .chart-placeholder {
            background: #f8f9fa;
            border: 2px dashed #ddd;
            padding: 40px;
            text-align: center;
            color: #666;
            border-radius: 8px;
        }
        .top-performers {
            background: white;
            border: 1px solid #e1e5e9;
            border-radius: 8px;
            padding: 15px;
        }
        .performer-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #f0f0f0;
        }
        .performer-item:last-child {
            border-bottom: none;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #e1e5e9;
            padding-top: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${metadata.title}</h1>
        <div class="subtitle">
            ${metadata.dateRange} • ${metadata.totalRecords} records
        </div>
    </div>

    <div class="summary">
        <h2>Executive Summary</h2>
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number">${summary.totalSandwiches.toLocaleString()}</div>
                <div class="stat-label">Total Sandwiches</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${summary.totalHosts}</div>
                <div class="stat-label">Active Hosts</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${summary.activeProjects}</div>
                <div class="stat-label">Active Projects</div>
            </div>
        </div>
        
        ${summary.topPerformers.length > 0 ? `
        <h3 style="color: #236383; margin-bottom: 10px;">Top Performers</h3>
        <div class="top-performers">
            ${summary.topPerformers.map(performer => `
                <div class="performer-item">
                    <span>${performer.name}</span>
                    <span><strong>${performer.value.toLocaleString()}</strong></span>
                </div>
            `).join('')}
        </div>
        ` : ''}
    </div>

    ${charts && charts.length > 0 ? `
    <div class="charts-section">
        <h2 style="color: #236383;">Charts & Visualizations</h2>
        ${charts.map(chart => `
            <div class="chart-section">
                <h3 class="chart-title">${chart.title}</h3>
                <div class="chart-placeholder">
                    📊 ${chart.type.toUpperCase()} Chart: ${chart.title}
                    <br><small>Visual representation of ${chart.data.length} data points</small>
                </div>
            </div>
        `).join('')}
    </div>
    ` : ''}

    <div class="data-section">
        <h2 style="color: #236383;">Detailed Data</h2>
        ${this.generateDataTable(data)}
    </div>

    <div class="footer">
        Generated by The Sandwich Project Management System<br>
        Report created on ${new Date(metadata.generatedAt).toLocaleString()}
    </div>
</body>
</html>
    `;
  }

  private static generateDataTable(data: any[]): string {
    if (!Array.isArray(data) || data.length === 0) {
      return '<p>No data available for this report.</p>';
    }

    const headers = Object.keys(data[0]);
    
    return `
      <table class="data-table">
        <thead>
          <tr>
            ${headers.map(header => `<th>${this.formatHeader(header)}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.map(row => `
            <tr>
              ${headers.map(header => `<td>${this.formatValue(row[header])}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  private static formatHeader(header: string): string {
    return header
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  private static formatValue(value: any): string {
    if (value === null || value === undefined) return '';
    
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    
    if (typeof value === 'string' && value.includes('T')) {
      // Likely a date string
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString();
        }
      } catch (e) {
        // Not a date, return as is
      }
    }
    
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch (e) {
        return String(value);
      }
    }
    
    return String(value);
  }
}