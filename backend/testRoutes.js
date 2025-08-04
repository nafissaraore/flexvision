// backend/testRoutes.js
const http = require('http');

function makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const parsedBody = body ? JSON.parse(body) : {};
                    resolve({
                        status: res.statusCode,
                        data: parsedBody,
                        headers: res.headers
                    });
                } catch (error) {
                    resolve({
                        status: res.statusCode,
                        data: body,
                        headers: res.headers
                    });
                }
            });
        });

        req.on('error', reject);
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

async function testBothServers() {
    console.log('🧪 Test des deux serveurs...\n');
    
    // Test du serveur de test (port 5001)
    console.log('='.repeat(60));
    console.log('🧪 TEST DU SERVEUR DE TEST (PORT 5001)');
    console.log('='.repeat(60));
    
    try {
        // Test de base
        const healthOptions = {
            hostname: 'localhost',
            port: 5001,
            path: '/',
            method: 'GET'
        };
        
        const healthResponse = await makeRequest(healthOptions);
        console.log('✅ Serveur de test accessible:', {
            status: healthResponse.status,
            message: healthResponse.data.message
        });
        
        // Test d'inscription
        console.log('\n📝 Test d\'inscription sur serveur de test...');
        const signupOptions = {
            hostname: 'localhost',
            port: 5001,
            path: '/api/auth/signup',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        };
        
        const testEmail = `test-${Date.now()}@example.com`;
        const signupData = {
            firstName: 'TestUser',
            lastName: 'Backend',
            email: testEmail,
            password: 'testpassword123'
        };
        
        const signupResponse = await makeRequest(signupOptions, signupData);
        console.log('📝 Résultat inscription:', {
            status: signupResponse.status,
            message: signupResponse.data.message || 'Pas de message',
            userCreated: !!signupResponse.data.user,
            userEmail: signupResponse.data.user?.email
        });
        
        // Test de connexion avec le nouvel utilisateur
        if (signupResponse.status === 201) {
            console.log('\n🔐 Test de connexion avec le nouvel utilisateur...');
            const signinOptions = {
                hostname: 'localhost',
                port: 5001,
                path: '/api/auth/signin',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            };
            
            const signinData = {
                email: testEmail,
                password: 'testpassword123'
            };
            
            const signinResponse = await makeRequest(signinOptions, signinData);
            console.log('🔐 Résultat connexion:', {
                status: signinResponse.status,
                message: signinResponse.data.message || 'Pas de message',
                userFound: !!signinResponse.data.user
            });
        }
        
    } catch (error) {
        console.log('❌ Erreur serveur de test:', error.message);
    }
    
    // Test du serveur principal (port 5000)
    console.log('\n' + '='.repeat(60));
    console.log('🚨 TEST DU SERVEUR PRINCIPAL (PORT 5000)');
    console.log('='.repeat(60));
    
    try {
        const mainHealthOptions = {
            hostname: 'localhost',
            port: 5000,
            path: '/',
            method: 'GET'
        };
        
        const mainHealthResponse = await makeRequest(mainHealthOptions);
        console.log('✅ Serveur principal accessible:', {
            status: mainHealthResponse.status
        });
        
        // Test des routes d'auth sur le serveur principal
        const mainSignupOptions = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/signup',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        };
        
        const mainSignupData = {
            firstName: 'TestMain',
            lastName: 'Server',
            email: `testmain-${Date.now()}@example.com`,
            password: 'testpassword123'
        };
        
        const mainSignupResponse = await makeRequest(mainSignupOptions, mainSignupData);
        console.log('📝 Test inscription serveur principal:', {
            status: mainSignupResponse.status,
            message: mainSignupResponse.data.message || 'Pas de message',
            error: mainSignupResponse.data.error || 'Pas d\'erreur'
        });
        
    } catch (error) {
        console.log('❌ Erreur serveur principal:', error.message);
        console.log('💡 Le serveur principal ne répond pas - c\'est votre problème !');
    }
}

// Exécuter le test
testBothServers().then(() => {
    console.log('\n🏁 Tests terminés!');
    console.log('\n📋 Analyse:');
    console.log('✅ Si le serveur de test fonctionne mais pas le principal → Problème de routing');
    console.log('❌ Si aucun ne fonctionne → Problème de base de données ou modèles');
    console.log('\n🔍 Prochaines étapes:');
    console.log('1. Montrez-moi votre server.js principal');
    console.log('2. Montrez-moi vos routes d\'authentification');
    console.log('3. Comparez avec le serveur de test qui fonctionne');
});