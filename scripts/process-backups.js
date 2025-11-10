// scripts/process-backups.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function processBackups() {
    console.log('🔄 Procesando backups de Axe Watcher...');
    console.log('='.repeat(60));

    const backupsDir = path.join(__dirname, '../backups/axe-watcher');

    if (!fs.existsSync(backupsDir)) {
        console.log('📭 No hay backups para procesar');
        return;
    }

    const backupFiles = fs.readdirSync(backupsDir)
        .filter(file => file.endsWith('.json'))
        .map(file => path.join(backupsDir, file))
        .sort((a, b) => fs.statSync(b).mtime.getTime() - fs.statSync(a).mtime.getTime());

    if (backupFiles.length === 0) {
        console.log('📭 No se encontraron archivos de backup');
        return;
    }

    console.log(`📂 Backups encontrados: ${backupFiles.length}`);

    // Procesar backups recientes
    const recentBackups = backupFiles.slice(0, 10);
    const summary = {
        totalBackups: backupFiles.length,
        processed: 0,
        totalViolations: 0,
        demos: {}
    };

    for (const backupFile of recentBackups) {
        try {
            const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
            await processBackupFile(backupFile, backupData, summary);
            summary.processed++;
        } catch (error) {
            console.error(`❌ Error procesando ${path.basename(backupFile)}:`, error.message);
        }
    }

    displayBackupSummary(summary);
    cleanupOldBackups(backupFiles);
}

async function processBackupFile(filepath, backupData, summary) {
    const filename = path.basename(filepath);
    const violations = backupData.violations?.length || backupData.results?.violations?.length || 0;

    summary.totalViolations += violations;

    // Agrupar por demo
    const demoNumber = backupData.demoNumber || backupData.results?.demoNumber;
    if (demoNumber) {
        if (!summary.demos[demoNumber]) {
            summary.demos[demoNumber] = { backups: 0, violations: 0 };
        }
        summary.demos[demoNumber].backups++;
        summary.demos[demoNumber].violations += violations;
    }

    console.log(`   ✅ ${filename} - ${violations} violaciones`);
}

function displayBackupSummary(summary) {
    console.log('\n📊 RESUMEN DE BACKUPS');
    console.log('='.repeat(60));
    console.log(`Total backups: ${summary.totalBackups}`);
    console.log(`Procesados: ${summary.processed}`);
    console.log(`Total violaciones: ${summary.totalViolations}`);

    if (Object.keys(summary.demos).length > 0) {
        console.log('\n🎯 BACKUPS POR DEMO:');
        Object.entries(summary.demos).forEach(([demo, data]) => {
            console.log(`   Demo ${demo}: ${data.backups} backups, ${data.violations} violaciones`);
        });
    }

    // Recomendaciones basadas en los backups
    console.log('\n💡 RECOMENDACIONES:');
    if (summary.totalViolations > 50) {
        console.log('   ⚠️  Alto número de violaciones - Revisar demos críticos');
    }

    const demoWithMostViolations = Object.entries(summary.demos)
        .sort(([, a], [, b]) => b.violations - a.violations)[0];

    if (demoWithMostViolations) {
        console.log(`   🎯 Demo ${demoWithMostViolations[0]} tiene más violaciones (${demoWithMostViolations[1].violations})`);
    }
}

function cleanupOldBackups(backupFiles, keepLast = 20) {
    if (backupFiles.length <= keepLast) {
        return;
    }

    const filesToDelete = backupFiles.slice(keepLast);
    console.log(`\n🗑️  Limpiando backups antiguos (manteniendo los últimos ${keepLast})...`);

    filesToDelete.forEach(file => {
        try {
            fs.unlinkSync(file);
            console.log(`   ✅ Eliminado: ${path.basename(file)}`);
        } catch (error) {
            console.error(`   ❌ Error eliminando ${path.basename(file)}:`, error.message);
        }
    });

    console.log(`   📊 Total eliminados: ${filesToDelete.length}`);
}

processBackups().catch(error => {
    console.error('💥 Error procesando backups:', error.message);
    process.exit(1);
});