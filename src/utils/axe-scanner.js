// src/utils/axe-scanner.js
const axe = require('axe-core');
const fs = require('fs');
const path = require('path');

class HTMLAccessibilityScanner {
    constructor() {
        this.results = [];
    }

    async scanHTMLFile(filePath) {
        try {
            const htmlContent = fs.readFileSync(filePath, 'utf8');
            
            // Configuración de axe
            const config = {
                rules: [
                    {
                        id: 'color-contrast',
                        enabled: true
                    },
                    {
                        id: 'image-alt',
                        enabled: true
                    },
                    {
                        id: 'button-name',
                        enabled: true
                    },
                    {
                        id: 'label',
                        enabled: true
                    },
                    {
                        id: 'heading-order',
                        enabled: true
                    }
                ]
            };

            // Ejecutar análisis
            const results = await axe.run(htmlContent, config);
            this.results.push({
                file: path.basename(filePath),
                timestamp: new Date().toISOString(),
                results: results
            });

            return this.generateReport(results);
        } catch (error) {
            console.error('Error scanning file:', error);
            throw error;
        }
    }

    generateReport(axeResults) {
        const report = {
            totalViolations: axeResults.violations.length,
            violationsByImpact: {
                critical: 0,
                serious: 0,
                moderate: 0,
                minor: 0
            },
            violations: []
        };

        axeResults.violations.forEach(violation => {
            report.violationsByImpact[violation.impact]++;
            
            report.violations.push({
                id: violation.id,
                impact: violation.impact,
                description: violation.description,
                help: violation.help,
                helpUrl: violation.helpUrl,
                nodes: violation.nodes.map(node => ({
                    target: node.target,
                    failureSummary: node.failureSummary,
                    html: node.html
                }))
            });
        });

        return report;
    }

    saveReport(report, outputPath) {
        fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
        console.log(`Report saved to: ${outputPath}`);
    }
}

module.exports = HTMLAccessibilityScanner;