import { exec } from 'child_process';
import { promisify } from 'util';
import axios from 'axios';

const execAsync = promisify(exec);

async function networkDiagnostic() {
    console.log('🔍 Diagnóstico de Red para Deque Hub\n');
    console.log('🎯 URL objetivo: https://axe.deque.com\n');

    const tests = [
        {
            name: 'DNS Resolution',
            command: 'nslookup axe.deque.com',
            successPattern: 'Address'
        },
        {
            name: 'HTTP Connectivity',
            command: 'curl -I --connect-timeout 10 https://axe.deque.com',
            successPattern: 'HTTP'
        },
        {
            name: 'Quick HTTP Test',
            command: 'curl -s -o /dev/null -w "%{http_code}" https://axe.deque.com',
            successPattern: '200|301|302'
        }
    ];

    for (const test of tests) {
        try {
            console.log(`\n🧪 ${test.name}...`);
            const { stdout, stderr } = await execAsync(test.command, { timeout: 15000 });

            if (stdout.includes(test.successPattern) || (test.successPattern.test && test.successPattern.test(stdout))) {
                console.log('✅ Conectividad OK');
                if (stdout.length < 300) {
                    console.log('   Output:', stdout);
                }
            } else {
                console.log('⚠️  Respuesta inesperada');
                console.log('   Output:', stdout.substring(0, 200));
            }
        } catch (error) {
            console.log('❌ Error:', error.message);
        }
    }

    // Test adicional con axios
    console.log('\n🌐 Probando con Axios...');
    try {
        const response = await axios.get('https://axe.deque.com', { timeout: 10000 });
        console.log('✅ Axios conectado correctamente');
        console.log(`   Status: ${response.status}`);
        console.log(`   Headers:`, Object.keys(response.headers).slice(0, 5));
    } catch (error) {
        if (error.response) {
            console.log(`✅ Servidor responde: ${error.response.status}`);
        } else {
            console.log(`❌ Error Axios: ${error.code || error.message}`);
        }
    }
}

networkDiagnostic();