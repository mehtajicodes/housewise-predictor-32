import jsPDF from 'jspdf';
import { formatCurrency } from './formatters';

interface PropertyReport {
  prediction: {
    predictedPrice: number;
    confidence: number;
    priceRange: {
      lower: number;
      upper: number;
    };
    pricePerSqFt: number;
    trendData: Array<{
      month: string;
      price: number;
    }>;
  };
  inputSummary: {
    propertySize: string;
    bedBath: string;
    yearBuilt: string;
    location: string;
  };
}

export const generateReport = (data: PropertyReport) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Add header
  doc.setFontSize(20);
  doc.setTextColor(66, 66, 66);
  doc.text('Property Valuation Report', pageWidth / 2, yPos, { align: 'center' });
  
  // Add date
  yPos += 10;
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, yPos, { align: 'center' });

  // Add predicted price section
  yPos += 20;
  doc.setFontSize(16);
  doc.setTextColor(66, 66, 66);
  doc.text('Predicted Value', 20, yPos);
  
  yPos += 10;
  doc.setFontSize(24);
  doc.setTextColor(79, 70, 229);  // Indigo color
  doc.text(formatCurrency(data.prediction.predictedPrice), 20, yPos);

  // Add confidence and range
  yPos += 15;
  doc.setFontSize(12);
  doc.setTextColor(66, 66, 66);
  doc.text(`Confidence Level: ${data.prediction.confidence}%`, 20, yPos);
  
  yPos += 8;
  doc.text(`Value Range: ${formatCurrency(data.prediction.priceRange.lower)} - ${formatCurrency(data.prediction.priceRange.upper)}`, 20, yPos);
  
  // Add property details section
  yPos += 20;
  doc.setFontSize(16);
  doc.text('Property Details', 20, yPos);
  
  yPos += 10;
  doc.setFontSize(12);
  const details = [
    ['Property Size:', data.inputSummary.propertySize],
    ['Configuration:', data.inputSummary.bedBath],
    ['Year Built:', data.inputSummary.yearBuilt],
    ['Location:', data.inputSummary.location],
    ['Price per Sq Ft:', formatCurrency(data.prediction.pricePerSqFt)]
  ];

  details.forEach(([label, value]) => {
    yPos += 8;
    doc.setTextColor(128, 128, 128);
    doc.text(label, 20, yPos);
    doc.setTextColor(66, 66, 66);
    doc.text(value, 80, yPos);
  });

  // Add price trend section
  yPos += 20;
  doc.setFontSize(16);
  doc.text('Price Trend (Last 12 Months)', 20, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  const trendData = data.prediction.trendData;
  const months = trendData.map(d => d.month);
  const prices = trendData.map(d => formatCurrency(d.price));
  
  // Create a simple table for trend data
  const tableWidth = pageWidth - 40;
  const colWidth = tableWidth / 4;
  let startX = 20;
  let currentX = startX;
  
  for (let i = 0; i < trendData.length; i++) {
    if (i % 4 === 0) {
      currentX = startX;
      yPos += 8;
    }
    doc.setTextColor(128, 128, 128);
    doc.text(trendData[i].month, currentX, yPos);
    doc.setTextColor(66, 66, 66);
    doc.text(formatCurrency(trendData[i].price), currentX, yPos + 4);
    currentX += colWidth;
  }

  // Add footer
  yPos = doc.internal.pageSize.getHeight() - 20;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('Generated by HouseWise Property Predictor', pageWidth / 2, yPos, { align: 'center' });

  // Save the PDF
  const fileName = `property-valuation-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}; 