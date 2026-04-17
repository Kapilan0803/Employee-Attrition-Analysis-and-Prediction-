import os
import uuid
import pandas as pd
from fastapi import APIRouter
from pydantic import BaseModel
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, PageBreak
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from ml.trainer import get_metrics
import datetime

router = APIRouter()
REPORTS_DIR = "./reports"

class ReportRequest(BaseModel):
    csv_path: str
    report_type: str = "FULL"

@router.post("/generate")
def generate_report(request: ReportRequest):
    os.makedirs(REPORTS_DIR, exist_ok=True)

    filename = f"eaap_report_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:6]}.pdf"
    pdf_path = os.path.join(REPORTS_DIR, filename)

    try:
        df = pd.read_csv(request.csv_path)
        df.columns = df.columns.str.strip()
        metrics = get_metrics()

        doc = SimpleDocTemplate(pdf_path, pagesize=A4,
                                rightMargin=40, leftMargin=40,
                                topMargin=60, bottomMargin=40)
        styles = getSampleStyleSheet()
        story = []

        # Title
        title_style = ParagraphStyle('Title', parent=styles['Title'],
                                     fontSize=22, textColor=colors.HexColor('#7c3aed'),
                                     spaceAfter=10, alignment=TA_CENTER)
        story.append(Paragraph("Employee Attrition Analysis Report", title_style))
        story.append(Paragraph(f"Generated: {datetime.datetime.now().strftime('%B %d, %Y %H:%M')}",
                               ParagraphStyle('Sub', parent=styles['Normal'], alignment=TA_CENTER,
                                              textColor=colors.grey, fontSize=10)))
        story.append(Spacer(1, 20))
        story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#7c3aed')))
        story.append(Spacer(1, 20))

        # Summary Metrics
        heading = ParagraphStyle('Heading', parent=styles['Heading2'],
                                 textColor=colors.HexColor('#7c3aed'), spaceAfter=8)
        story.append(Paragraph("1. Executive Summary", heading))

        total = len(df)
        att_count = df['Attrition'].str.lower().eq('yes').sum() if 'Attrition' in df.columns else 0
        att_rate = round(att_count / total * 100, 1) if total > 0 else 0

        summary_data = [
            ['Metric', 'Value'],
            ['Total Employees', str(total)],
            ['Attrition Cases', str(att_count)],
            ['Attrition Rate', f"{att_rate}%"],
            ['Average Age', f"{df['Age'].mean():.1f}" if 'Age' in df.columns else 'N/A'],
            ['Avg Monthly Income', f"${df['MonthlyIncome'].mean():,.0f}" if 'MonthlyIncome' in df.columns else 'N/A'],
            ['Avg Years at Company', f"{df['YearsAtCompany'].mean():.1f}" if 'YearsAtCompany' in df.columns else 'N/A'],
        ]
        t = Table(summary_data, colWidths=[3*inch, 2*inch])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#7c3aed')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#f8f7ff'), colors.white]),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('PADDING', (0, 0), (-1, -1), 8),
        ]))
        story.append(t)
        story.append(Spacer(1, 20))

        # Department breakdown
        if 'Department' in df.columns and 'Attrition' in df.columns:
            story.append(Paragraph("2. Department-wise Attrition", heading))
            dept_data = [['Department', 'Total', 'Attrition', 'Rate']]
            dept_groups = df.groupby('Department')
            for dept, grp in dept_groups:
                att = grp['Attrition'].str.lower().eq('yes').sum()
                rate = round(att / len(grp) * 100, 1)
                dept_data.append([str(dept), str(len(grp)), str(att), f"{rate}%"])

            t2 = Table(dept_data, colWidths=[2.5*inch, 1.2*inch, 1.2*inch, 1.2*inch])
            t2.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2563eb')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#eff6ff'), colors.white]),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('PADDING', (0, 0), (-1, -1), 7),
            ]))
            story.append(t2)
            story.append(Spacer(1, 20))

        # ML Metrics
        if isinstance(metrics, dict) and 'accuracy' in metrics:
            story.append(Paragraph("3. Machine Learning Model Performance", heading))
            ml_data = [
                ['Metric', 'Score'],
                ['Accuracy', f"{metrics['accuracy']*100:.1f}%"],
                ['Precision', f"{metrics['precision']*100:.1f}%"],
                ['Recall', f"{metrics['recall']*100:.1f}%"],
                ['F1-Score', f"{metrics['f1_score']*100:.1f}%"],
                ['Model', metrics.get('model', 'Random Forest')],
            ]
            t3 = Table(ml_data, colWidths=[3*inch, 2*inch])
            t3.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#059669')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#f0fdf4'), colors.white]),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('PADDING', (0, 0), (-1, -1), 8),
            ]))
            story.append(t3)
            story.append(Spacer(1, 20))

        # Footer note
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#e2e8f0')))
        story.append(Spacer(1, 10))
        story.append(Paragraph(
            "This report was generated automatically by the EAAP (Employee Attrition Analysis & Prediction) system. "
            "The predictions are based on historical data and ML models — use them as guidance, not absolute truth.",
            ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8, textColor=colors.grey, alignment=TA_CENTER)
        ))

        doc.build(story)

        return {
            "success": True,
            "pdf_path": pdf_path,
            "filename": filename,
            "report_type": request.report_type
        }
    except Exception as e:
        return {"success": False, "error": str(e)}
